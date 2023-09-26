# Introduction
What is this? This is a template to create your own vanilla minecraft server on AWS. It's pretty basic, and saves a ton of money if you're a casual player who hops on with friends a few times a month. Instead of paying $15/mo for a server site, this springs up a vanilla world where 3-4 people can pay for as low as a couple bucks a month.

## Architechture
We are using a very simple EC2 with ECS design for hosting the server, and a lambda with an api gateway to toggle the server on and off. You should be able to retrieve the API URL endpoint from the CloudFormation Output, and be able to toggle the server on and off using {{ApiUrl}}/toggle.

The server IP needs to be fetched from the running task, as its not static. and also can't be outputted to CloudFormation.

## Improvements
We could add Route 53, and hide the static IP and the random API url to toggle the lambda. We could also add some more better logging, and command input capabilities. However, this is introducing more services, and hence, more cost.

## How to Use
Please use this template and then fill in the github repository secrets with the variables and their respective values in the .env file

This will help setup the CI/CD and make sure all deploys go smoothly. Then please push to the main branch, and the code will start deploying on AWS


### Author
Mihir Wadekar