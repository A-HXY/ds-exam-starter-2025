import { SNSHandler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.REGION });

export const handler: SNSHandler = async (event) => {
  console.log("SNS Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const snsMsg = record.Sns;
    const parsed = JSON.parse(snsMsg.Message);

    const hasEmail = snsMsg.MessageAttributes?.email?.Value !== undefined;
    
    if (!hasEmail) {
      console.log("Missing email, sending to QueueB");
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.QUEUE_URL,
          MessageBody: JSON.stringify(parsed),
        })
      );
    }
  }
};
