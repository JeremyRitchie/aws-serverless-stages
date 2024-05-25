import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import path = require('path');

import { BaseStack } from './base';
import { ALBStack } from './alb';


export interface ASGStackProps extends StackProps {
    baseStack: BaseStack;
    albStack: ALBStack;
}

export class ASGStack extends Stack {
    securityGroup: ec2.SecurityGroup;
    asg: autoscaling.AutoScalingGroup;
  constructor(scope: Construct, id: string, props: ASGStackProps) {
    super(scope, id, props);

    this.securityGroup = new ec2.SecurityGroup(this, 'InstanceSecurityGroup', {
        vpc: props.baseStack.vpc,
    });

    const launchTemplate = new ec2.LaunchTemplate(this, 'LaunchTemplate', {
        machineImage: new ec2.AmazonLinuxImage(),
        instanceType: new ec2.InstanceType('t3.medium'),
        securityGroup: this.securityGroup,
        role: new iam.Role(this, 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2RoleforSSM'),
            ],
        }),
        userData: ec2.UserData.custom(`
            #!/bin/bash
            yum update -y
            yum install -y docker
            usermod -a -G docker ec2-user
            id ec2-user
            newgrp docker
            systemctl enable docker.service
            systemctl start docker.service
            systemctl status docker.service
        `),
    });

    this.asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
        vpc: props.baseStack.vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        minCapacity: 1,
        maxCapacity: 1,
        desiredCapacity: 1,
        launchTemplate: launchTemplate,
    });

    this.asg.connections.allowFrom(props.albStack.alb, ec2.Port.tcp(8080));
    this.asg.attachToApplicationTargetGroup(props.albStack.targetGroup);




  }
}