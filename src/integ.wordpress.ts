import * as cdk from '@aws-cdk/core';
import { WordPress } from './wordpress';


const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new cdk.Stack(app, 'demo-wordpress', { env });

new WordPress(stack, 'WP', {
  auroraServerless: true,
  spot: true,
  enableExecuteCommand: true,
});

