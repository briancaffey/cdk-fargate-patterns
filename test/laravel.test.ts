import '@aws-cdk/assert/jest';
import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import { Laravel } from '../src';

let app: cdk.App;
let env: { region: string; account: string };
let stack: cdk.Stack;


beforeEach(() => {
  app = new cdk.App();
  env = {
    region: 'us-east-1',
    account: '123456789012',
  };
  stack = new cdk.Stack(app, 'demo-stack', { env });
});


// match snapshot
test('Snapshot', () => {
  /**
   * laravel-nginx-php-fpm
   */
  new Laravel(stack, 'LaravelNginxDemo', {
    auroraServerless: true,
    spot: true,
    enableExecuteCommand: true,
    code: path.join(__dirname, '../services/laravel-nginx-php-fpm'),
    loadbalancer: { port: 80 },
  });


  /**
   * laravel-bitnami
   */
  new Laravel(stack, 'LaravelBitnamiDemo', {
    auroraServerless: true,
    spot: true,
    enableExecuteCommand: true,
    code: path.join(__dirname, '../services/laravel-bitnami'),
    containerPort: 3000,
    loadbalancer: { port: 80 },
  });
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
