import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseStack } from '../common/base';
import { ALBStack } from '../common/alb';
import { ECSStack } from '../common/ecs';
import { AuroraStack } from '../common/aurora';
import { Route53Stack } from '../common/route53';

interface Stage2Props {
  env: Environment;
}

export class Stage2 extends Construct {
  constructor(scope: Construct, id: string, props: Stage2Props) {
    super(scope, id);

    const base = new BaseStack(this, 'BaseStack', {
        env: props.env,
        cidr: '10.101.0.0/16',
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
        enableHttps: true,
        enableHttpRedirect: true,
        createDNSRecord: true,
    });

    const ecs = new ECSStack(this, 'ECSStack', {
        env: props.env,
        baseStack: base,
        albStack: alb,
    });

    new AuroraStack(this, 'AuroraStack', {
        env: props.env,
        baseStack: base,
        ecsStack: ecs,
    });
  }
}