import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';



export interface DynamoDBStackProps extends StackProps {
  cidr: string;
}

export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'my-table',
    });
  }
}