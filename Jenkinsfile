env.DOCKERHUB_USERNAME = 'urvil38'

  node("docker-test") {
    checkout scm

    stage("Unit Test") {
      sh "docker run --rm -w /code -v ${WORKSPACE}:/code mhart/alpine-node sh -c \"npm i; npm test\""
    }
    stage("Integration Test") {
      try {
        sh "docker build -t jenkins_node ."
        sh "docker rm -f jenkins_node || true"
        sh "docker run -d -p 8080:8080 --name=jenkins_node jenkins_node"
        // env variable is used to set the server where go test will connect to run the test
       //sh "docker run --rm -v ${WORKSPACE}:/code --link=jenkins_node -e SERVER=jenkins_node mhart/alpine-node npm test"
      }
      catch(e) {
        error "Integration Test failed"
      }finally {
        sh "docker rm -f jenkins_node || true"
        sh "docker ps -aq | xargs docker rm || true"
        sh "docker images -aq -f dangling=true | xargs docker rmi || true"
      }
    }
    stage("Build") {
      sh "docker build -t ${DOCKERHUB_USERNAME}/jenkins_node:${BUILD_NUMBER} ."
    }
    stage("Publish") {
      withDockerRegistry([credentialsId: 'DockerHub']) {
        sh "docker push ${DOCKERHUB_USERNAME}/jenkins_node:${BUILD_NUMBER}"
      }
    }
  }

  node("docker-stage") {
    checkout scm

    stage("Staging") {
      try {
        sh "docker rm -f jenkins_node || true"
        sh "docker run -d -p 8080:8080 --name=jenkins_node ${DOCKERHUB_USERNAME}/jenkins_node:${BUILD_NUMBER}"
        sh "docker run --rm -v ${WORKSPACE}:/code ${DOCKERHUB_USERNAME}/jenkins_node npm test"

      } catch(e) {
        error "Staging failed"
      } finally {
        sh "docker rm -f jenkins_node || true"
        sh "docker ps -aq | xargs docker rm || true"
        sh "docker images -aq -f dangling=true | xargs docker rmi || true"
      }
    }
  }

  node("docker-prod") {
    stage("Production") {
      try {
        // Create the service if it doesn't exist otherwise just update the image
        sh '''
          SERVICES=$(docker service ls --filter name=jenkins_node --quiet | wc -l)
          if [[ "$SERVICES" -eq 0 ]]; then
            docker network rm jenkins_node || true
            docker network create --driver overlay --attachable jenkins_node
            docker service create --replicas 3 --network jenkins_node --name jenkins_node -p 8080:8080 ${DOCKERHUB_USERNAME}/jenkins_node:${BUILD_NUMBER}
          else
            docker service update --image ${DOCKERHUB_USERNAME}/jenkins_node:${BUILD_NUMBER} jenkins_node
          fi
          '''
        // run some final tests in production
        checkout scm
        sh '''
          sleep 60s 
          for i in `seq 1 20`;
          do
            STATUS=$(docker service inspect --format '{{ .UpdateStatus.State }}' jenkins_node)
            if [[ "$STATUS" != "updating" ]]; then
              docker run --rm -v ${WORKSPACE}:/code --network jenkins_node jenkins_node npm test
              break
            fi
            sleep 10s
          done
          
        '''
      }catch(e) {
        sh "docker service update --rollback  jenkins_node"
        error "Service update failed in production"
      }finally {
        sh "docker ps -aq | xargs docker rm || true"
      }
    }
  }