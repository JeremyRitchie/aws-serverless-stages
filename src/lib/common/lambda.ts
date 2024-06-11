import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as _lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import { Duration } from 'aws-cdk-lib';

export interface LambdaStackProps extends StackProps {
    lambdaDir: string;
}

export class LambdaStack extends Stack {
  lambda: _lambda.Function;
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.lambda = new _lambda.DockerImageFunction(this, 'Lambda', {
        code: _lambda.DockerImageCode.fromImageAsset(path.join(__dirname, props.lambdaDir)),
        architecture: _lambda.Architecture.ARM_64,
        timeout: Duration.seconds(30),
    });

  }
}