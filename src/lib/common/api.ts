import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw_integration from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { BaseStack } from './base';
import { ALBStack } from './alb';
import { LambdaStack } from './lambda';


export interface APIStackProps extends StackProps {
    baseStack: BaseStack;
    albStack: ALBStack;
    lambdaStack: LambdaStack;
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const httpApi = new apigw.HttpApi(this, 'HttpApi');

    const vpcLink = new apigw.VpcLink(this, 'VpcLink', {
        vpc: props.baseStack.vpc });

    new apigw_integration.HttpAlbIntegration('ALBIntegration', props.albStack.alb.listeners[0], {});

    const get_time = new apigw_integration.HttpLambdaIntegration('BooksIntegration', props.lambdaStack.lambda);

    httpApi.addRoutes({
      path: '/books',
      methods: [ apigw.HttpMethod.GET ],
      integration: get_time,
    });

    const httpIntegration = new apigw.HttpIntegration(this, 'MyHttpIntegration', {
        httpApi: httpApi,
        integrationType: apigw.HttpIntegrationType.HTTP_PROXY,
        connectionId: 'connectionId',
        connectionType: apigw.HttpConnectionType.VPC_LINK,
        integrationUri: 'integrationUri',
        method: apigw.HttpMethod.ANY,
    });



  }
}