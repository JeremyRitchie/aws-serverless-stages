import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import path = require('path');

import { BaseStack } from './base';
import { ASGStack } from './asg';


export interface RDSStackProps extends StackProps {
    baseStack: BaseStack;
    asgStack: ASGStack;
}

export class RDSStack extends Stack {
  db: rds.DatabaseInstance;
  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    const securityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
        vpc: props.baseStack.vpc,
    });

    this.db = new rds.DatabaseInstance(this, 'Instance', {
        vpc: props.baseStack.vpc,
        engine: rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
        allocatedStorage: 20,
        credentials: rds.Credentials.fromGeneratedSecret('postgres'),
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [securityGroup],
    });

    securityGroup.addIngressRule(props.asgStack.securityGroup, ec2.Port.tcp(5432)); // allow inbound traffic from the EC2 instance

  }
}