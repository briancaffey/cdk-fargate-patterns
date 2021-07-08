import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cdk from '@aws-cdk/core';
import { Laravel } from './laravel';

const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new cdk.Stack(app, 'demo-laravel', { env });
const certArn = stack.node.tryGetContext('ACM_CERT_ARN');
const cert = certArn ? acm.Certificate.fromCertificateArn(stack, 'Cert', certArn) : undefined;

/**
 * laravel-nginx-php-fpm
 */
new Laravel(stack, 'LaravelNginxDemo', {
  auroraServerless: true,
  spot: true,
  enableExecuteCommand: true,
  code: path.join(__dirname, '../services/laravel-nginx-php-fpm'),
  loadbalancer: cert ? { port: 443, certificate: [cert] } : { port: 80 },
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
  loadbalancer: cert ? { port: 443, certificate: [cert] } : { port: 80 },
});
