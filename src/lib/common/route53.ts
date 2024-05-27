import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface Route53StackProps extends StackProps {
    subdomain: string;
}

export class Route53Stack extends Stack {
    cert: acm.Certificate;
    hostedzone: route53.IHostedZone;
    subdomain: string;
  constructor(scope: Construct, id: string, props: Route53StackProps) {
    super(scope, id, props);

    this.subdomain = props.subdomain;
    this.hostedzone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: 'jeremyritchie.com',
    });

    this.cert = new acm.Certificate(this, 'Certificate', {
        domainName: props.subdomain + '.jeremyritchie.com',
        validation: acm.CertificateValidation.fromDns(this.hostedzone),
    });
  }
}