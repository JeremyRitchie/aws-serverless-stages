import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { LambdaStack } from './lambda';

export interface DynamoDBStackProps extends StackProps {
  tables: { tableName: string, partitionKey: string, sortKey: string, lambdaStacks: LambdaStack[] }[];
}

export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    props.tables.forEach(table => {
      const dbTable = new dynamodb.Table(this, table.tableName, {
        partitionKey: { name: table.partitionKey, type: dynamodb.AttributeType.STRING },
        sortKey: table.sortKey ? { name: table.sortKey, type: dynamodb.AttributeType.STRING } : undefined,
        tableName: table.tableName,
      });
      table.lambdaStacks.forEach(lambdaStack => {
        dbTable.grantReadWriteData(lambdaStack.lambda);
      });
    });
  }
}