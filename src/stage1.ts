import { Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { elbv2 } from 'aws-cdk-lib';

import { BaseStack } from './lib/base';
import { ASGStack } from './lib/asg';
import { ALBStack } from './lib/alb';

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

    const alb = new ALBStack(this, 'ALBStack', {
        env: props.env,
        baseStack: base,
        targetType: elbv2.TargetType.INSTANCE,
    });

    const asg = new ASGStack(this, 'ASGStack', {
        env: props.env,
        baseStack: base,
        albStack: alb,
    });
  }

}