"""Exercise lifecycle commands with a fake Docker CLI; never touch real containers."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("app-lifecycle.sh").resolve()
MOCK_DOCKER = """#!/bin/sh
set -eu
echo "$*" >> "$MOCK_LOG"
case "$1 $2" in
    'container inspect')
        [ "${MOCK_MISSING:-}" != "$5" ] || exit 1
        if [ "$4" = '{{.Name}}' ]; then
            echo "/$5"
        else
            cat "$MOCK_STATE_DIR/$5"
        fi
        ;;
    'container start'|'container stop')
        operation=$2
        shift 2
        for name in "$@"; do
            [ "${MOCK_FAIL:-}" != "$name" ] || exit 1
            [ "${MOCK_NO_CHANGE:-}" != "$name" ] || continue
            if [ "$operation" = start ]; then state=true; else state=false; fi
            printf '%s' "$state" > "$MOCK_STATE_DIR/$name"
        done
        ;;
    *) echo 'Unexpected Docker operation' >&2; exit 99 ;;
esac
"""


class LifecycleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="ram-lifecycle-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name, text in [("docker", MOCK_DOCKER), ("sleep", "#!/bin/sh\nexit 0\n")]:
            executable = self.root / name
            executable.write_text(text, encoding="utf-8", newline="\n")
            executable.chmod(0o755)
        for name in ["backend", "frontend", "demo-backend", "demo-frontend"]:
            (self.root / name).write_text("false", encoding="utf-8")
        self.env = dict(os.environ, PATH=str(self.root) + os.pathsep + os.environ["PATH"],
                        MOCK_STATE_DIR=self.root.as_posix(), MOCK_LOG=(self.root / "calls").as_posix())
        self.shell = os.environ.get("LIFECYCLE_TEST_SHELL") or shutil.which("sh")
        if not self.shell:
            self.fail("Set LIFECYCLE_TEST_SHELL to a POSIX shell executable.")

    def run_action(self, action, backend="backend", frontend="frontend", **overrides):
        return subprocess.run([self.shell, SCRIPT.as_posix(), action, backend, frontend],
                              env=dict(self.env, **overrides), capture_output=True, text=True)

    def calls(self):
        log = self.root / "calls"
        return log.read_text().splitlines() if log.exists() else []

    def test_start_orders_backend_before_frontend(self):
        result = self.run_action("start")
        self.assertEqual(result.returncode, 0, result.stderr)
        mutations = [line for line in self.calls() if line.startswith("container start")]
        self.assertEqual(mutations, ["container start backend", "container start frontend"])

    def test_stop_orders_frontend_before_backend_and_is_repeatable(self):
        for name in ["backend", "frontend"]:
            (self.root / name).write_text("true")
        for _ in range(2):
            result = self.run_action("stop")
            self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("container stop frontend backend", self.calls())
        self.assertEqual((self.root / "backend").read_text(), "false")
        self.assertEqual((self.root / "frontend").read_text(), "false")

    def test_missing_frontend_does_not_start_backend(self):
        result = self.run_action("start", MOCK_MISSING="frontend")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any(line.startswith("container start") for line in self.calls()))

    def test_docker_failure_propagates(self):
        result = self.run_action("start", MOCK_FAIL="backend")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("container start frontend", self.calls())

    def test_state_mismatch_fails(self):
        result = self.run_action("start", MOCK_NO_CHANGE="frontend")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("frontend: expected running=true", result.stderr)

    def test_verify_requires_both_running_without_mutation(self):
        (self.root / "backend").write_text("true")
        self.assertNotEqual(self.run_action("verify-running").returncode, 0)
        (self.root / "frontend").write_text("true")
        self.assertEqual(self.run_action("verify-running").returncode, 0)
        self.assertTrue(all(line.startswith("container inspect") for line in self.calls()))

    def test_invalid_inputs_never_call_docker(self):
        for args in [("delete", "backend", "frontend"), ("stop", "--all", "frontend"),
                     ("stop", "backend", "backend"), ("stop", "", "frontend")]:
            self.assertEqual(self.run_action(*args).returncode, 2)
        self.assertEqual(self.calls(), [])

    def test_demo_names_leave_original_app_alone(self):
        result = self.run_action("start", "demo-backend", "demo-frontend")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.root / "backend").read_text(), "false")
        self.assertEqual((self.root / "frontend").read_text(), "false")


if __name__ == "__main__":
    unittest.main()
