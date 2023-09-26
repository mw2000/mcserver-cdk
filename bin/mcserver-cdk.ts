#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MCServerStack } from '../lib/mcserver-cdk-stack';

const env = process.env.ENVIRONMENT || 'prod'
const app = new cdk.App();
const stack = new MCServerStack(app, 'mcserver-stack', {
  env: {
    account: process.env.AWS_ACCOUNT || '',
    region: process.env.AWS_REGION || '',
  },
  memoryLimit: parseInt(process.env.MEMORY_LIMIT || '2048') || 2048
});

cdk.Tags.of(stack).add('project', 'odyssey');
cdk.Tags.of(stack).add('project-sku', 'no-sku');
cdk.Tags.of(stack).add('env', env) ;
cdk.Tags.of(stack).add('auto-generated', 'true');
cdk.Tags.of(stack).add('auto-generated-tool', 'aws-cdk')