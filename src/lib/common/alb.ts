import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';

import { BaseStack } from './base';
import { Route53Stack } from './route53';


export interface ALBStackProps extends StackProps {
    targetType: elbv2.TargetType;
    baseStack: BaseStack;
    route53Stack: Route53Stack;
    enableHttps: boolean;
    enableHttpRedirect: boolean;
    createDNSRecord: boolean;
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
        targetType: props.targetType,
        deregistrationDelay: Duration.seconds(0),
    });

    if (props.enableHttps) {
        this.alb.addListener('HTTPS', {
            port: 443,
            protocol: elbv2.ApplicationProtocol.HTTPS,
            defaultAction: elbv2.ListenerAction.forward([this.targetGroup]),
            certificates: [props.route53Stack.cert]
        });
    }

    if (props.enableHttpRedirect) {
        this.alb.addListener('HTTP', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            defaultAction: elbv2.ListenerAction.redirect({
                protocol: 'HTTPS',
                port: '443',
                permanent: true,
            }),
        });
    } else {
        this.alb.addListener('HTTP', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            defaultAction: elbv2.ListenerAction.forward([this.targetGroup]),
        });
    }

    if (props.createDNSRecord) {
        new route53.ARecord(this, 'AliasRecord', {
            zone: props.route53Stack.hostedzone,
            target: route53.RecordTarget.fromAlias(new route53_targets.LoadBalancerTarget(this.alb)),
            recordName: props.route53Stack.subdomain,
        });
    }

  }
}