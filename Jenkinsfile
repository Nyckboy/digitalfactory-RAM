pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    parameters {
        choice(name: 'ACTION', choices: ['DEPLOY', 'STOP', 'START'],
               description: 'DEPLOY builds and releases; STOP/START control existing app containers.')
    }

    environment {
        // Use distinct names and deployment settings when adapting this pipeline for the demo.
        APP_BACKEND_CONTAINER = 'backend'
        APP_FRONTEND_CONTAINER = 'frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def action = params.ACTION ?: 'DEPLOY'
                    if (!(action in ['DEPLOY', 'STOP', 'START'])) {
                        error('Unknown ACTION: choose DEPLOY, STOP, or START.')
                    }
                    currentBuild.description = action
                }
            }
        }

        stage('Stop App') {
            when { expression { params.ACTION == 'STOP' } }
            steps {
                sh 'sh ci/app-lifecycle.sh stop "$APP_BACKEND_CONTAINER" "$APP_FRONTEND_CONTAINER"'
            }
        }

        stage('Start App') {
            when { expression { params.ACTION == 'START' } }
            steps {
                sh 'sh ci/app-lifecycle.sh start "$APP_BACKEND_CONTAINER" "$APP_FRONTEND_CONTAINER"'
            }
        }

        stage('Build and Deploy') {
            when { expression { (params.ACTION ?: 'DEPLOY') == 'DEPLOY' } }
            tools {
                maven 'Maven3'
                nodejs 'Node20'
            }
            environment {
                DB_USER     = credentials('db-user')
                DB_PASSWORD = credentials('db-password')
                JWT_SECRET  = credentials('jwt-secret')
                AI_API_KEY  = credentials('ai-api-key')
                NVD_API_KEY = credentials('nvd-api-key')
            }
            stages {

                // ============================================================
                // DEVSECOPS: SECRETS SCANNING
                // ============================================================
                stage('Secrets Scan (GitLeaks)') {
                    steps {
                        script {
                            // Added --no-git to bypass the Docker/Jenkins user permission clash
                            // It will scan the current files in the workspace instantly
                            sh '''
                            docker run --rm -v ${WORKSPACE}:/path zricethezav/gitleaks:latest detect --no-git --source="/path" -v
                            '''
                        }
                    }
                }

                // ============================================================
                // DEVSECOPS: PARALLEL BUILD STAGE
                // ============================================================
                stage('Build & Test') {
                    parallel {
                        stage('Backend (Spring Boot)') {
                            steps {
                                dir('backend') {
                                    // Build the executable JAR
                                    sh 'mvn clean package'
                                }
                            }
                        }

                        stage('Frontend (React)') {
                            steps {
                                dir('frontend') {
                                    // Use pnpm as requested
                                    sh 'pnpm install'
                                    sh 'VITE_API_BASE_URL=/api VITE_API_SOCKET_URL=ws://116.203.28.139:8082/ws/websocket pnpm build'
                                }
                            }
                        }
                    }
                }

                // ============================================================
                // DEVSECOPS: DEPENDENCY SCANNING (SCA)
                // ============================================================
                stage('Dependency Scan (SCA)') {
                    parallel {
                        stage('Backend Dependencies') {
                            steps {
                                dir('backend') {
                                    // Uses OWASP to check Java dependencies for known CVEs
                                    // Fails the build only if High/Critical flaws (Score 7.0+) are found
                                    sh 'mvn org.owasp:dependency-check-maven:check -DfailBuildOnCVSS=7.0 -DknownExploitedEnabled=false -DnvdApiKey=$NVD_API_KEY'
                                }
                            }
                        }

                        stage('Frontend Dependencies') {
                            steps {
                                dir('frontend') {
                                    // Native pnpm audit checks for compromised npm packages
                                    // Fails the build if high or critical vulnerabilities are found
                                    sh 'pnpm audit --audit-level=high'
                                }
                            }
                        }
                    }
                }

                // ============================================================
                // DEVSECOPS: SONARQUBE ANALYSIS & QUALITY GATE
                // ============================================================
                stage('SonarQube Analysis') {
                    steps {
                        // Uses the server name defined in Jenkins > Configure System
                        withSonarQubeEnv('My SonarQube Server') {
                            dir('backend') {
                                // Maven automatically detects SonarQube and runs the scan
                                script {
                                    def cleanBranch = env.BRANCH_NAME ? env.BRANCH_NAME.replaceAll('/', '-') : 'main'
                                    sh "mvn sonar:sonar \
                                        -Dsonar.projectKey=com.digitalfactory.platform:${cleanBranch} \
                                        -Dsonar.projectName='Backend - ${cleanBranch}'"
                                }
                            }
                        }
                    }
                }

                stage('Quality Gate') {
                    steps {
                        // Pauses pipeline until SonarQube sends back OK or ERROR
                        timeout(time: 5, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
                    }
                }
                // ============================================================

                stage('Build Docker Images') {
                    steps {
                        // Build the lightweight containers using the artifacts we just created
                        sh 'docker build -t my-app-backend ./backend'
                        sh 'docker build -t my-app-frontend ./frontend'
                    }
                }

                // ============================================================
                // DEVSECOPS: CONTAINER SECURITY SCANNING
                // ============================================================
                stage('Scan Docker Images (Trivy)') {
                    parallel {
                        stage('Scan Backend Image') {
                            steps {
                                // Scans the locally built backend image for High and Critical vulnerabilities
                                // Added trivy-cache volume to prevent downloading the DB every run
                                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache-backend:/root/.cache/trivy aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress my-app-backend'
                            }
                        }
                        stage('Scan Frontend Image') {
                            steps {
                                // Scans the locally built frontend image
                                // Reuses the exact same cache volume for lightning-fast scanning
                                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache-frontend:/root/.cache/trivy aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress my-app-frontend'
                            }
                        }
                    }
                }

                stage('Deploy') {
                    steps {
                        // Example: Deploying via Docker Compose or starting containers directly.
                        // We pass the Jenkins credentials securely into the deployment environment.
                        sh '''
                          docker rm -f "$APP_BACKEND_CONTAINER" || true
                          docker rm -f "$APP_FRONTEND_CONTAINER" || true
                          # 1. Start the backend on host port 8082
                          # It joins the network to talk to the frontend, and uses host.docker.internal for the DB
                          docker run -d --name "$APP_BACKEND_CONTAINER" \
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
                          docker run -d --name "$APP_FRONTEND_CONTAINER" \
                            --network digitalfactory-net \
                            -p 3003:80 my-app-frontend
                          '''
                    }
                }

                stage('Verify Containers') {
                    steps {
                        sh 'sh ci/app-lifecycle.sh verify-running "$APP_BACKEND_CONTAINER" "$APP_FRONTEND_CONTAINER"'
                    }
                }
            }
            post {
                always {
                    // Image cleanup belongs to deployments, not Start/Stop operations.
                    sh 'docker image prune -f'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
