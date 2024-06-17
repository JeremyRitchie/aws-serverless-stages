import { App } from 'aws-cdk-lib';
import { Stage1 } from './lib/app/stage1';
import { Stage2 } from './lib/app/stage2';
import { Stage3 } from './lib/app/stage3';
import { Stage4 } from './lib/app/stage4';

const app = new App();

new Stage1(app, 'Stage1', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
}});

new Stage2(app, 'Stage2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
}});

new Stage3(app, 'Stage3', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
}});

new Stage4(app, 'Stage4', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
}});


app.synth();