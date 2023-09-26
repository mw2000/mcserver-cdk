import { ECS } from 'aws-sdk';

const ecs = new ECS();

const {CLUSTER_NAME, SERVICE_NAME} = process.env

exports.handler = async (event: any) => {
  try {
    const response = await ecs.describeServices({
      cluster: CLUSTER_NAME || '',
      services: [SERVICE_NAME || '']
    }).promise();

    const service = response.services![0];

    // If tasks are running, stop the service by setting desired count to 0
    if (service.runningCount! > 0) {
      await ecs.updateService({
        cluster: CLUSTER_NAME || '',
        service: SERVICE_NAME || '',
        desiredCount: 0
      }).promise();
    } 
    // If no tasks are running, start the service by setting desired count to 1
    else {
      await ecs.updateService({
        cluster: CLUSTER_NAME || '',
        service: SERVICE_NAME || '',
        desiredCount: 1
      }).promise();
    }

    return {
      statusCode: 200,
      body: 'Toggle operation successful!'
    };

} catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Failed to toggle the service!'
    };
  }
};