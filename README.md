### for this project to work you will need to add an application.yml

```bash
  spring:
  config:
    import: optional:file:.env

  datasource:
    # url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:digitalfactory}
    url: jdbc:postgresql://localhost:5432/digitalfactory
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

application:
  security:
    jwt:
      secret-key: ${token}
      expiration: 86400000 # 24 hours in milliseconds
```
