import { StackProps } from "aws-cdk-lib";

export interface MCServerStackProps extends StackProps{
  env: {
    account: string
    region: string
  }
  memoryLimit: number
}