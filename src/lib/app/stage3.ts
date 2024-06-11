import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';

import { BaseStack } from '../common/base';
import { ALBStack } from '../common/alb';
import { APIStack } from '../common/api';
import { Route53Stack } from '../common/route53';
import { LambdaStack } from '../common/lambda';
// import { AuroraStack } from '../common/aurora';
import { ECSStack } from '../common/ecs';
import { DynamoDBStack } from '../common/dynamodb';

interface Stage3Props {
  env: Environment;
}

export class Stage3 extends Construct {
  constructor(scope: Construct, id: string, props: Stage3Props) {
    super(scope, id);

    const base = new BaseStack(this, 'BaseStack', {
        env: props.env,
        cidr: '10.102.0.0/16',
    });

    const route53 = new Route53Stack(this, 'Route53Stack', {
      env: props.env,
      subdomain: 'stage3'
    });

    const alb = new ALBStack(this, 'ALBStack', {
        env: props.env,
        baseStack: base,
        targetType: elbv2.TargetType.IP,
        route53Stack: route53,
        enableHttps: false,
        enableHttpRedirect: false,
        createDNSRecord: false,

    });

    const getWeather = new LambdaStack(this, 'GetWeatherLambdaStack', {
        env: props.env,
        lambdaDir: '../../../lambda/get_weather',
    });

    new APIStack(this, 'APIStack', {
      env: props.env,
      baseStack: base,
      albStack: alb,
      route53Stack: route53,
      createDNSRecord: true,
      lambdaIntegration: [
        {
          stack: getWeather,
          path: '/weather',
          methods: [ apigw.HttpMethod.GET ]
        }
      ],
    });

    new ECSStack(this, 'ECSStack', {
      env: props.env,
      baseStack: base,
      albStack: alb,
      environmentVariables: {'TEMPLATE': 'index_v2.html'}
    });

    new DynamoDBStack(this, 'DynamoDBStack', {
      env: props.env,
      tables: [
        {
          tableName: 'Weather',
          partitionKey: 'City',
          sortKey: 'Date',
          lambdaStacks: [getWeather]
        }
      ]
    });

    // new AuroraStack(this, 'AuroraStack', {
    //     env: props.env,
    //     baseStack: base,
    //     ecsStack: ecs,
    // });
  }

}