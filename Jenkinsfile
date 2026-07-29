pipeline {
    agent any

    tools {
        maven 'Maven3'
        nodejs 'Node20'
    }
    
    environment {
        // These should be configured in Jenkins > Manage Jenkins > Credentials
        DB_USER     = credentials('db-user')
        DB_PASSWORD = credentials('db-password')
        JWT_SECRET  = credentials('jwt-secret')
        AI_API_KEY  = credentials('ai-api-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    // Build the executable JAR
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    // Use pnpm as requested
                    sh 'pnpm install'
                    sh 'VITE_API_BASE_URL=/api pnpm build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build the lightweight containers using the artifacts we just created
                sh 'docker build -t my-app-backend ./backend'
                sh 'docker build -t my-app-frontend ./frontend'
            }
        }

        stage('Deploy') {
            steps {
                // Example: Deploying via Docker Compose or starting containers directly.
                // We pass the Jenkins credentials securely into the deployment environment.
                sh '''
                  # 1. Start the backend on host port 8082
                  # It joins the network to talk to the frontend, and uses host.docker.internal for the DB
                  docker run -d --name backend \
                    --network digitalfactory-net \
                    --add-host host.docker.internal:host-gateway \
                    -e SPRING_PROFILES_ACTIVE=prod \
                    -e DB_HOST=host.docker.internal \
                    -e DB_PORT=5432 \
                    -e DB_USER=$DB_USER \
                    -e DB_PASSWORD=$DB_PASSWORD \
                    -e JWT_SECRET=$JWT_SECRET \
                    -e AI_API_KEY=$AI_API_KEY \
                    -p 8082:8080 my-app-backend

                  # 2. Start the frontend on host port 3000
                  docker run -d --name frontend \
                    --network digitalfactory-net \
                    -p 3002:80 my-app-frontend
                  '''
            }
        }
        
        stage('Health Check') {
            steps {
                // Allow a few seconds for Spring Boot to start
                sleep time: 15, unit: 'SECONDS'
                // Hit the LLM/DB validation endpoint you specified
                sh 'curl -f http://localhost:8082/api/admin/projects/ai/test || exit 1'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
