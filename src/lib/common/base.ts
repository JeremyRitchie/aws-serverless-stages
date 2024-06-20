import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface BaseStackProps extends StackProps {
  cidr: string;
}

export class BaseStack extends Stack {
  vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC', {
        maxAzs: 2,
        createInternetGateway: true,
        subnetConfiguration: [
            {
                name: 'public',
                subnetType: ec2.SubnetType.PUBLIC,
            },
            {
                name: 'private',
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            }
        ],
        natGateways: 1,
        ipAddresses: ec2.IpAddresses.cidr(props.cidr),
    });
  }
}