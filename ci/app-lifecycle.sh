#!/bin/sh
# Control only the named application containers; leave the database intact.
set -eu

if [ "$#" -ne 3 ]; then
    echo 'Usage: app-lifecycle.sh start|stop|verify-running BACKEND_CONTAINER FRONTEND_CONTAINER' >&2
    exit 2
fi
action=$1
backend=$2
frontend=$3
case "$action" in
    start|stop|verify-running) ;;
    *) echo "Unsupported action: $action" >&2; exit 2 ;;
esac
for container in "$backend" "$frontend"; do
    case "$container" in
        ''|[!a-zA-Z0-9]*|*[!a-zA-Z0-9_.-]*)
            echo "Invalid container name: $container" >&2; exit 2 ;;
    esac
done
if [ "$backend" = "$frontend" ]; then
    echo 'Backend and frontend must be different containers.' >&2
    exit 2
fi

# Check both exist before making changes. Never print container environment secrets.
for container in "$backend" "$frontend"; do
    if ! docker container inspect --format '{{.Name}}' "$container" >/dev/null; then
        echo "Cannot inspect $container. Check the Docker host and deploy first if it is missing." >&2
        exit 1
    fi
done
case "$action" in
    stop)
        docker container stop "$frontend" "$backend"
        expected=false
        ;;
    start)
        docker container start "$backend"
        docker container start "$frontend"
        expected=true
        ;;
    verify-running) expected=true ;;
esac

# Detect immediate exits. This checks process state, not HTTP readiness.
if [ "$expected" = true ]; then sleep 5; fi
for container in "$backend" "$frontend"; do
    running=$(docker container inspect --format '{{.State.Running}}' "$container")
    if [ "$running" != "$expected" ]; then
        echo "$container: expected running=$expected, got running=$running" >&2
        exit 1
    fi
    echo "$container: running=$running"
done
