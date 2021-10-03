const { AwsCdkConstructLibrary, DevEnvironmentDockerImage, Gitpod } = require('projen');

const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const project = new AwsCdkConstructLibrary({
  author: 'Pahud Hsieh',
  authorAddress: 'pahudnet@gmail.com',
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'cdk-fargate-patterns',
  description: 'CDK patterns for serverless container with AWS Fargate',
  repositoryUrl: 'https://github.com/pahud/cdk-fargate-patterns.git',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-efs',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-rds',
    '@aws-cdk/aws-route53',
    '@aws-cdk/aws-route53-targets',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-certificatemanager',
    '@aws-cdk/aws-elasticloadbalancingv2',
  ],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: AUTOMATION_TOKEN,
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['pahud'],
  },
  publishToPypi: {
    distName: 'cdk-fargate-patterns',
    module: 'cdk_fargate_patterns',
  },
  catalog: {
    announce: false,
    twitter: 'pahudnet',
  },
  keywords: [
    'cdk',
    'fargate',
    'serverless',
    'aws',
  ],
});


const gitpodPrebuild = project.addTask('gitpod:prebuild', {
  description: 'Prebuild setup for Gitpod',
});
// install and compile only, do not test or package.
gitpodPrebuild.exec('yarn install --frozen-lockfile --check-files');
gitpodPrebuild.exec('npx projen compile');

let gitpod = new Gitpod(project, {
  dockerImage: DevEnvironmentDockerImage.fromFile('.gitpod.Dockerfile'),
  prebuilds: {
    addCheck: true,
    addBadge: true,
    addLabel: true,
    branches: true,
    pullRequests: true,
    pullRequestsFromForks: true,
  },
});

gitpod.addCustomTask({
  init: 'yarn gitpod:prebuild',
  // always upgrade after init
  command: 'npx projen upgrade',
});

gitpod.addVscodeExtensions(
  'dbaeumer.vscode-eslint',
  'ms-azuretools.vscode-docker',
  'AmazonWebServices.aws-toolkit-vscode',
);

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', 'dependabot.yml', 'website/public'];
project.npmignore.exclude(...common_exclude, 'images', 'docs', 'website');
project.gitignore.exclude(...common_exclude);

project.synth();
