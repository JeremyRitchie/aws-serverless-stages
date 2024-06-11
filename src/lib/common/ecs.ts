import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import path = require('path');

import { BaseStack } from './base';
import { ALBStack } from './alb';


export interface ECSStackProps extends StackProps {
    environmentVariables?: { [key: string]: string; } | undefined;
    baseStack: BaseStack;
    albStack: ALBStack;
}

export class ECSStack extends Stack {
  service: ecs.FargateService;
  constructor(scope: Construct, id: string, props: ECSStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'Cluster', {
        vpc: props.baseStack.vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
        memoryLimitMiB: 512,
        cpu: 256,
        runtimePlatform: {
            operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
            cpuArchitecture: ecs.CpuArchitecture.ARM64,
        },
    });

    taskDefinition.executionRole?.attachInlinePolicy(new iam.Policy(this, 'task-policy', {
        statements: [new iam.PolicyStatement({
            actions: [
                'ecr:GetAuthorizationToken',
                'ecr:BatchCheckLayerAvailability',
                'ecr:GetDownloadUrlForLayer',
                'ecr:BatchGetImage',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: ['*'],
        })],
      }));

    taskDefinition.addContainer('Container', {
        image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../../../flask-app')),
        memoryLimitMiB: 256,
        cpu: 128,
        portMappings: [{ containerPort: 8080 }],
        logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'flask-app-ecs' }),
        environment: props.environmentVariables,
    });

    this.service = new ecs.FargateService(this, 'Service', {
        cluster: cluster,
        taskDefinition: taskDefinition,
        desiredCount: 1,
        assignPublicIp: false,
    });
    this.service.connections.allowFrom(props.albStack.alb, ec2.Port.tcp(8080));
    props.albStack.targetGroup.addTarget(this.service);
  }
}