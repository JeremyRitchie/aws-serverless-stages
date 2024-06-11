import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw_integration from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';

import { BaseStack } from './base';
import { ALBStack } from './alb';
import { LambdaStack } from './lambda';
import { Route53Stack } from './route53';


export interface APIStackProps extends StackProps {
    baseStack: BaseStack;
    albStack?: ALBStack;
    lambdaIntegration: { stack: LambdaStack, path: string, methods: apigw.HttpMethod[] }[];
    route53Stack: Route53Stack;
    createDNSRecord: boolean;
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const httpApi = new apigw.HttpApi(this, 'HttpApi');

    props.lambdaIntegration.forEach((lambda) => {
      const integration = new apigw_integration.HttpLambdaIntegration('LambdaIntegration', lambda.stack.lambda);

      httpApi.addRoutes({
        path: lambda.path,
        methods: lambda.methods,
        integration: integration,
      });
    });

    if (props.albStack != undefined) {
      httpApi.addRoutes({
        path: '/{proxy+}',
        methods: [ apigw.HttpMethod.ANY ],
        integration: new apigw_integration.HttpAlbIntegration(
            'GithubReposAppIntegration',
            props.albStack.alb.listeners[0],
        ),
      });
    }

    if (props.createDNSRecord) {
      const domainName = new apigw.DomainName(this, 'DomainName', {
        domainName:  props.route53Stack.subdomain + '.jeremyritchie.com',
        certificate:  props.route53Stack.cert,
      });
      new apigw.ApiMapping(this, 'MyApiMapping', {
        api: httpApi,
        domainName: domainName,
        stage: httpApi.defaultStage,
      });
      new route53.ARecord(this, 'AliasRecord', {
        zone: props.route53Stack.hostedzone,
        target: route53.RecordTarget.fromAlias(new route53_targets.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId)),
        recordName: props.route53Stack.subdomain,
      });
    }
  }
}