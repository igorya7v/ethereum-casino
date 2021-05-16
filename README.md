# Decentralized Casino Dapp

*A sample project to demonstrate a full stack development and CI/CD of the Ethereum Smart Contracts and Frontend DApp (React).*

## Components
  * Backend is implemented as an Ethereum Smart Contract, please see the backend folder for more details.
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

# Job #1 - Deploy Casino Smart Contract into the Ethereum Testnet (Ropsten)
  * Checkout the code
  * Install Truffle Framework
  * Compile the Casino Smart Contract
  * Run Unit Tests
  * Deploy into the Ethereum Testnet (Ropsten) using the Credentials from the Github Secrets (backend/truffle-config.js)
  * *Pass the generated Casino.json file as an artifact to the Job #2*

# Job #2 - Deploy React Dapp into the AWS Contrainer Service (ECR)
  * Depends on Job #1 to complete
  * Checkout the code
  * Fetch the Casino.json file as an artifact from Job #1 (this file contains the ABI and Ethereum Address of the deployed Smart Contract in Job #1)
  * Run the Python Helper Script (inject-script.py) to inject the ABI and the Contract Address into the generated frontend/src/js/config.js file.
  * Build the React DApp (npm run build)
  * Build a lean docker image (frontend/Dockerfile)
  * Fill in the new image ID in the Amazon ECS task definition (frontend/ecs-task-definition.json)
  * Login to AWS Container Registry (ECR) using the credentials defined in Github Secrets
  * Deploy the DApp image into the AWS Container Service (ECR)

### AWS Container Service

