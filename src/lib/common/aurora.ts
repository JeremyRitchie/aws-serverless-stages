import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { BaseStack } from './base';
import { ECSStack } from './ecs';


export interface AuroraStackProps extends StackProps {
    baseStack: BaseStack;
    ecsStack: ECSStack;
}

export class AuroraStack extends Stack {
    cluster: rds.DatabaseCluster;
  constructor(scope: Construct, id: string, props: AuroraStackProps) {
    super(scope, id, props);

    const securityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
        vpc: props.baseStack.vpc,
    });

    const parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
        engine: rds.DatabaseClusterEngine.auroraPostgres({
            version: rds.AuroraPostgresEngineVersion.VER_15_5,
        }),
        parameters: {
            'shared_preload_libraries': 'pg_stat_statements',
            'pg_stat_statements.track': 'all',
        },
    });

    this.cluster = new rds.DatabaseCluster(this, 'Database', {
        engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
        writer: rds.ClusterInstance.serverlessV2('writer'),
        serverlessV2MinCapacity: 2,
        serverlessV2MaxCapacity: 10,
        vpc: props.baseStack.vpc,
        credentials: rds.Credentials.fromGeneratedSecret('postgres'),
        parameterGroup: parameterGroup,
        securityGroups: [securityGroup],
      });

    // allow inbound traffic from the ECS service
    securityGroup.addIngressRule(props.ecsStack.service.connections.securityGroups[0], ec2.Port.tcp(5432));

  }
}