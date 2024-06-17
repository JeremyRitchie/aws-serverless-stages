import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import { BaseStack } from '../common/base';
import { ASGStack } from '../common/asg';
import { ALBStack } from '../common/alb';
import { RDSStack } from '../common/rds';
import { Route53Stack } from '../common/route53';

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
        subdomain: 'stage1'
    });

    const alb = new ALBStack(this, 'ALBStack', {
        env: props.env,
        baseStack: base,
        targetType: elbv2.TargetType.INSTANCE,
        route53Stack: route53,
        enableHttps: true,
        enableHttpRedirect: true,
        createDNSRecord: true,
    });

    const asg = new ASGStack(this, 'ASGStack', {
        env: props.env,
        baseStack: base,
        albStack: alb,
        imageName: 'cdk-hnb659fds-container-assets-747340109238-ap-southeast-2:990ea04fa5898d765437c64eaedf5073cfd311fee6997050c6bc975ba2543e6a',
    });

    new RDSStack(this, 'RDSStack', {
        env: props.env,
        baseStack: base,
        asgStack: asg,
    });
  }

}