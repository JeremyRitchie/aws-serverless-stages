import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

import { BaseStack } from './base';


export interface ALBStackProps extends StackProps {
    targetType: elbv2.TargetType;
    baseStack: BaseStack;
}

export class ALBStack extends Stack {
  alb: elbv2.ApplicationLoadBalancer;
  targetGroup: elbv2.ApplicationTargetGroup;
  constructor(scope: Construct, id: string, props: ALBStackProps) {
    super(scope, id, props);

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
        vpc: props.baseStack.vpc,
        internetFacing: true,
    });

    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
        vpc: props.baseStack.vpc,
        port: 8080,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: props.targetType
    });

    this.alb.addListener('HTTP', {
        port: 80,
        protocol: elbv2.ApplicationProtocol.HTTP,
        defaultAction: elbv2.ListenerAction.forward([this.targetGroup]),
    });

  }
}