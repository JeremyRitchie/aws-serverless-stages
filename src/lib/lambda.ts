import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as _lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export interface EC2StackProps extends StackProps {
    lambdaDir: string;
}

export class EC2Stack extends Stack {
  lambda: _lambda.Function;
  constructor(scope: Construct, id: string, props: EC2StackProps) {
    super(scope, id, props);

    this.lambda = new _lambda.Function(this, 'Lambda', {
        runtime: _lambda.Runtime.PYTHON_3_10,
        handler: 'lambda_function.lambda_handler',
        code: _lambda.Code.fromDockerBuild(path.join(__dirname, props.lambdaDir)),
    });

  }
}