# fragments

A microservice deployed on AWS

# npm scripts

## start

The "start" script runs our server normally

## dev

"dev" runs it via nodemon, which watches the src/\*\* folder for any changes, restarting the server whenever something is updated

## debug

"debug" is the same as dev but also starts the node inspector on port 9229, so that you can attach a debugger

### env

"dev": "cross-env ...",
"debug": "cross-env ..."
dev and debug starts require cross-env

# eslint.config.mjs

changed { languageOptions: { globals: globals.browser } } to globals: globals.node

# Eslint package.json changes

Added a lint script to package.json file to run ESLint from the command line

# Additional packages

Installed Pino Pretty using "npm install --save pino pino-pretty pino-http"
Allows for Structured Logging

Installed middleware: cors, express, helmet, compression

# for sending files use format

`pscp -i "D:/DPS 955/dps955-lab4-key-pair.ppk" fragments-0.0.1.tgz ec2-user@3.95.182.209:/home/ec2-user/`

`ssh -i "D:/DPS 955/dps955-lab4-key-pair.ppk" ec2-user@3.95.182.209`

`pscp -i "D:/DPS 955/dps955-lab4-key-pair.ppk" .env ec2-user@3.95.182.209:/home/ec2-user/package/.env`

# Things to note:

`docker run --rm --name fragments --env-file .env -p 8080:8080 fragments:latest`

- The -p 8080:8080 means 8080 on the host (left-hand) and 8080 in the container (right-hand). If you wanted to bind port 8080 in the container to port 5000 in the host, you'd do -p 5000:8080

`tar -xvzf fragments-0.0.1.tgz` to unpack tarball

- a Dockerfile is for building a Docker Image, a docker-compose.yml file is for running Docker Containers

- using `--save`

  - Save installed packages to a package.json file as dependencies.
  - https://docs.npmjs.com/cli/v11/commands/npm-install#save

## The code BELOW was added to docker-compose.yml to run tests

````
      # Add these credentials for LocalStack mock (these are in local-aws-setup.sh file)
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_SESSION_TOKEN=test
      ```
````

- the **local-aws-setup.sh** script only sets the environment variables for running aws services. And these services' environment variables are set within their individual containers
- I need to set the environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` for my fragments container so that it can access the aws services containers such as s3 and dynamodb which are configured and run using the **local-aws-setup.sh** script

### NPM Version

1. 1.x.x is a MAJOR change
2. x.1.x is a MINOR change
3. x.x.1 is a PATCH change

## Data Split (DynamoDB and S3)

a fragment will be split across AWS S3 (data) and Amazon DynamoDB (metadata).

For DynamoDB, ownerId as our partition key, and the fragment id as our sort key

## Outcome
- Used a variety of thinking skills to anticipate and solve problems
- Versioned source code using git and GitHub
- Analyzed, evaluated, and applied relevant information from a variety of sources, in particular: official technical documentation
- Authenticated and Authorized users securely
- Developed, debugged, and deployed apps in cloud environments
- Understood how to develop, debug, and run software locally, in GitHub Actions, and in the cloud using containers
- Worked with container registries and repositories
- Applied best practices for creating secure, optimized containers
- Script installations and automation using common Linux commands
- Implemented data storage using managed cloud services
- Combined a mix of server-based and serverless architectures
- Developed software using cloud APIs and SDKs
- Developed automatic integration and deployment workflows (CI/CD)
