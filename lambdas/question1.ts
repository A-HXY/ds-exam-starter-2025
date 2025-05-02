import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    const movieId = event?.pathParameters?.movieId;
    const role = event?.queryStringParameters?.role;

    if (!movieId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing movieId" }),
      };
    }

    let commandInput: QueryCommandInput;

    if (role) {
      commandInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "movieId = :m AND begins_with(role, :r)",
        ExpressionAttributeValues: {
          ":m": parseInt(movieId),
          ":r": role,
        },
      };
    } else {
      commandInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "movieId = :m",
        ExpressionAttributeValues: {
          ":m": parseInt(movieId),
        },
      };
    }

    const result = await client.send(new QueryCommand(commandInput));

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
