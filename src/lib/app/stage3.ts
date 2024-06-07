import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseStack } from '../common/base';
import { ALBStack } from '../common/alb';
import { APIStack } from '../common/api';
import { Route53Stack } from '../common/route53';
import { LambdaStack } from '../common/lambda';

interface Stage1Props {
  env: Environment;
}

export class Stage1 extends Construct {
  constructor(scope: Construct, id: string, props: Stage1Props) {
    super(scope, id);

    const base = new BaseStack(this, 'BaseStack', {
        env: props.env,
        cidr: '10.100.0.0/16',
    });

    const route53 = new Route53Stack(this, 'Route53Stack', {
      env: props.env,
      subdomain: 'stage2'
  });

    const alb = new ALBStack(this, 'ALBStack', {
        env: props.env,
        baseStack: base,
        targetType: elbv2.TargetType.IP,
        route53Stack: route53,
    });

    const getWeather = new LambdaStack(this, 'GetWeatherLambdaStack', {
        env: props.env,
        lambdaDir: 'src/lambda/get-weather',
    });

    const api = new APIStack(this, 'APIStaclk', {
        env: props.env,
        baseStack: base,
        lambdaStack: getWeather,
        albStack: alb,
    });
  }

}