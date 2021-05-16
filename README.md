# Decentralized Casino Dapp

*A sample project to demonstrate a full stack development and CI/CD of the Ethereum Smart Contracts and Frontend DApp (React).*

## Components
  * Backend is implemented as an Ethereum Smart Contract using Solidity, OpenZeppelin and Trufle, please see the backend folder for more details.
  * Frontend is implemented with the React Framework, Webpack and Web3.js, please see the frontend folder for more details.
  * Frontend React DApp is containerized and deplpoyed to AWS Elastic Container Service (ECS), for more details see the frontend/Dockerfile and frontend/ecs-task-definition.json files.
  * Frontend transactions signatures are done using the MetaMask Plugin.
  * CI/CD is implemented by utilizing the Gihub Actions, please see the .github/workflows/ethereum-dapp-pipeline.yml for more details.
  * Helper Utility CI/CD script is written in Python, please see the inject-script.py for more details.

## Overview

### Backend
The development of the Casino Smart Cotract is done by using the *Solidity language, OpenZeppelin library and Truffle framework*.
  * The Casino Smart Contract: /backend/contracts/Casino.sol
  * UnitTests: backend/test/CasinoTest.js
  * Truffle Config file: backend/truffle-config.js


### Frontend
Frontend Dapp is implemented with the React Framefork, Webpack and Web3.js.
  * Main React/Javascript implenetation of interaction with the Deployed to Ethereum Network Casino Smart Contract is found in /frontend/src/js/index.js file.
  * Webpack configurations: frontend/webpack.config.js
  * The transactions signing is done by utilizing the MetaMask plugin.
  * Docker file that produce a *lean image* of the Dapp is found here: frontend/Dockerfile
  * The DApp docker image is uploaded to the AWS Docker Container Registry (ECR).
  * The DApp docker image deployment to AWS Container Service is configured in frontend/ecs-task-definition.json file.

### CI/CD Pipelines
The CI/CD pipeline is implemented with the Github Actions and contains two main Jobs.

### Job #1 - Deploy Casino Smart Contract into the Ethereum Testnet (Ropsten)
  * Checkout the code
  * Install Truffle Framework
  * Compile the Casino Smart Contract
  * Run Unit Tests
  * Deploy into the Ethereum Testnet (Ropsten) using the Credentials from the Github Secrets (backend/truffle-config.js)
  * *Pass the generated Casino.json file as an artifact to the Job #2*

### Job #2 - Deploy React Dapp into the AWS Contrainer Service (ECR)
  * Depends on Job #1 to complete
  * Checkout the code
  * Fetch the Casino.json file as an artifact from Job #1 (this file contains the ABI and Ethereum Address of the deployed Smart Contract in Job #1)
  * Run the Python Helper Script (inject-script.py) to inject the ABI and the Contract Address into the generated frontend/src/js/config.js file.
  * Build the React DApp (npm run build)
  * Build a lean docker image (frontend/Dockerfile)
  * Fill in the new image ID in the Amazon ECS task definition (frontend/ecs-task-definition.json)
  * Login to AWS Container Registry (ECR) using the credentials defined in Github Secrets
  * Deploy the DApp image into the AWS Container Service (ECR)

### AWS Container Service Setup

#### Create the ECR repository
```
aws ecr create-repository --repository-name igorya5v/react-dapp --region us-east-1
```
Ensure that you have an ecsTaskExecutionRole IAM role in your account. You can follow the [Amazon ECS Task Execution IAM Role guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html) to create the role.

##### Register a task definition

```
aws ecs register-task-definition --region us-east-1 --cli-input-json file://frontend/ecs-task-definition.json
```

##### Create an ECS cluster

Create the ECS cluster in the default VPC with this command:

```
aws ecs create-cluster --region us-east-1 --cluster-name eth-dapp-fargate
```

##### Create a security group

For the Fargate service we need a security group.

```
aws ec2 create-security-group --group-name et-dapp-sg --description "Group for Ethereum Dapp ECS Cluster"
{
    "GroupId": "sg-0dafe9b41b28f1bf5"
}
```

For our application we have to open port 80. Use the security GroupId returned from the previous command.

```
aws ec2 authorize-security-group-ingress --group-id sg-0dafe9b41b28f1bf5 --protocol tcp --port 80 --cidr 0.0.0.0/0
```

##### Create the Fargate service

This command creates a Fargate service using the task definition which we registered before. Use the security GroupId from above. Also use your subnet id’s from your default VPC in the command below.

```
aws ecs create-service --region us-east-1 --service-name eth-dapp-service --task-definition EthereumDappTask --desired-count 1 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[subnet-a06c17ed], securityGroups=[sg-0dafe9b41b28f1bf5],assignPublicIp=ENABLED}" --cluster eth-dapp-fargate
```

### Accessing the Deployed DApp after the successful deployment into the AWS Container Service

We need to get the public IP adress. First list the tasks in the fargate cluster:

```
aws ecs list-tasks  --cluster eth-dapp-fargate
```

Next get information about the running task:

```
aws ecs describe-tasks --task "arn:aws:ecs:us-east-1:665524042598:task/eth-dapp-fargate/3616c8cdb43f4015b912478a151762a0" --cluster eth-dapp-fargate
```

In the output of the above command you will find the “networkInterfaceId”.

```
{
    "name": "networkInterfaceId",
    "value": "eni-0078f4c2156c63883"
}
```

With the above networkInterfaceId you can find the public IP:

```
aws ec2 describe-network-interfaces --network-interface-ids eni-0078f4c2156c63883
```

In the output of the above command you will find the public IP adress:
```
"PublicDnsName": "ec2-34-247-74-194.us-east-1.compute.amazonaws.com",
"PublicIp": "34.247.74.194"
```

Now we can test the Ethereum/React DApp with a web browser of your choice.

##### Cleaning Up
The AWS resources are not free. To clean them up, run the following:

```
aws ecs delete-service --service eth-dapp-service --cluster eth-dapp-fargate --force
```

## TODO
Define infrustructure as a code for the AWS Container Service using tools like AWS Cloud Formation, Teraform, etc.
