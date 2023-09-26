import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MCServerStackProps } from './common';
import * as ec2 from 'aws-cdk-lib/aws-ec2' // import ec2 library 
import * as ecs from 'aws-cdk-lib/aws-ecs' // import ec2 library 
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import path = require('path');


export class MCServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MCServerStackProps) {
    super(scope, id, props);

    // Default VPC
    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    // Create a Security Group for Minecraft
    const minecraftSecurityGroup = new ec2.SecurityGroup(this, 'mcserver-security-group', {
      vpc: defaultVpc,
      description: 'Allow inbound connections on port 25565',
      allowAllOutbound: true   // default, allows your task to communicate with external services
    });
    
    minecraftSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(25565), 'Allow Minecraft traffic');

    // Define ECS cluster
    const cluster = new ecs.Cluster(this, 'mcserver-cluster', {
      vpc: defaultVpc
    });    

    const autoScalingGroup = cluster.addCapacity('mcserver-cluster-asg', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.LARGE),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      vpcSubnets: { subnets: defaultVpc.publicSubnets },
      desiredCapacity: 1,
    });

    autoScalingGroup.addSecurityGroup(minecraftSecurityGroup);
    
    // Define ECS task definition with container image and required settings
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'mcserver-task-def');  // Note: Using Ec2TaskDefinition now

    const container = taskDefinition.addContainer('mcserver-container', {
      image: ecs.ContainerImage.fromRegistry('itzg/minecraft-server'),
      memoryLimitMiB: props.memoryLimit,
      environment: {
        EULA: 'TRUE'
      }
    });

    container.addPortMappings({
      containerPort: 25565,
      hostPort: 25565
    });

    // Create ECS service with the task definition
    const ec2Service = new ecs.Ec2Service(this, 'mcserver-ec2-service', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1
    });

    // Create the IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda to manage ECS',
    });

    // Attach policies to the Lambda role
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecs:DescribeServices',
        'ecs:UpdateService',
        "ecs:StartTask",
        "ecs:StopTask",
        "ecs:DescribeTasks"
      ],
      resources: [`*`],
      effect: iam.Effect.ALLOW,
    }));

    // Create the Lambda function
    const toggleLambda = new lambda.Function(this, 'mcserver-toggle-lambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'src', 'lambdas', 'toggleServer')),
      handler: 'src/index.handler', // Assuming the function you're exporting in index.ts is named "handler"
      runtime: lambda.Runtime.NODEJS_14_X,
      role: lambdaRole,
      environment: {
        CLUSTER_NAME: cluster.clusterName,
        SERVICE_NAME: ec2Service.serviceName
      }
    });

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'mc-server-api-gateway', {
      restApiName: 'Minecraft Server Toggle Service',
      description: 'API to toggle the Minecraft server.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS, // this is also the default setting
      },
    });

    // Add a resource (endpoint) to your API Gateway
    const toggleResource = api.root.addResource('toggle');

    // Add a POST method to this resource which points to the Lambda function
    toggleResource.addMethod('POST', new apigateway.LambdaIntegration(toggleLambda));

    // Output the API Gateway URL to the CloudFormation output
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url!,
      description: 'The URL of the API Gateway',
    });
  }
}
