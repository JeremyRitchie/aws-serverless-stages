import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';

import { BaseStack } from '../common/base';
import { APIStack } from '../common/api';
import { Route53Stack } from '../common/route53';
import { LambdaStack } from '../common/lambda';
import { DynamoDBStack } from '../common/dynamodb';

interface Stage4Props {
  env: Environment;
}

export class Stage4 extends Construct {
  constructor(scope: Construct, id: string, props: Stage4Props) {
    super(scope, id);

    const base = new BaseStack(this, 'BaseStack', {
        env: props.env,
        cidr: '10.103.0.0/16',
    });

    const route53 = new Route53Stack(this, 'Route53Stack', {
      env: props.env,
      subdomain: 'stage4'
    });

    const getWeather = new LambdaStack(this, 'GetWeatherLambdaStack', {
        env: props.env,
        lambdaDir: '../../../lambda/get_weather',
    });

    const getTime = new LambdaStack(this, 'GetTimeLambdaStack', {
      env: props.env,
      lambdaDir: '../../../lambda/get_time',
    });

    const getRoot = new LambdaStack(this, 'GetRootLambdaStack', {
      env: props.env,
      lambdaDir: '../../../lambda/get_root',
    });

    new APIStack(this, 'APIStack', {
      env: props.env,
      baseStack: base,
      lambdaIntegration: [
        {
          stack: getWeather,
          path: '/weather',
          methods: [ apigw.HttpMethod.GET ]
        },
        {
          stack: getTime,
          path: '/time',
          methods: [ apigw.HttpMethod.GET ]
        },
        {
          stack: getRoot,
          path: '/',
          methods: [ apigw.HttpMethod.GET ]
        }
      ],
      route53Stack: route53,
      createDNSRecord: true,
    });

    new DynamoDBStack(this, 'DynamoDBStack', {
      env: props.env,
      tables: [
        {
          tableName: 'Weather',
          partitionKey: 'City',
          sortKey: 'Date',
          lambdaStacks: [getWeather]
        },
        {
          tableName: 'Time',
          partitionKey: 'City',
          sortKey: 'Date',
          lambdaStacks: [getTime]
        }
      ]
    });
  }

}