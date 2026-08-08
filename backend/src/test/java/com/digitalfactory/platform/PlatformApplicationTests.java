package com.digitalfactory.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    // These are literally just fake strings I typed out. Spring will accept them!
    "application.security.jwt.secret-key=this-is-just-a-fake-key-to-make-the-test-happy-12345",
    "ai.api.key=fake-ai-key",
		"ai.api.url=http://this-is-a-fake-url.com"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class PlatformApplicationTests {

	@Test
	void contextLoads() {
	}

}
