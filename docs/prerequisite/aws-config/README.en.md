---
title: Configure AWS CLI
weight: 1
---

To configure your AWS CLI with credentials, run below command

```sh
aws configure
```

Type your credentials and type **us-east-1** in terms of region name

```
AWS Access Key ID [None]: <type your access key id> 
AWS Secret Access Key [None]: <type your secret access key> 
Default region name [None]: us-east-1
Default output format [None]:
```

Run `aws sts get-caller-identity` to ensure the configuration.

```sh
aws sts get-caller-identity
```


```json
{
    "UserId": "{YOUR_USER_ID}",
    "Account": "{YOUR_AWS_ACCOUNT_ID}",
    "Arn": "arn:aws:iam::{YOUR_AWS_ACCOUNT_ID}:user/{YOUR_USER_NAME}"
}
```


{{% notice note %}}

If you forget the credentials, you need to create a new one from the [IAM console](https://console.aws.amazon.com/iam/home?region=us-east-1)

{{% /notice %}} 


