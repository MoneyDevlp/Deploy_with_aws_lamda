import { DocumentClient } from "aws-sdk/clients/dynamodb";
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'
import * as AWS from "aws-sdk";

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const logger = createLogger('todosAccess');
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const XAWS = AWSXRay.captureAWS(AWS);

export class TodoAccess {
  constructor(
    private dynamoDbClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private todosTable: any = process.env.TODOS_TABLE,
    private todosIndex = process.env.TODOS_USER_INDEX,
    private bucketName = process.env.S3_BUCKET,
    private s3Client = new XAWS.S3({ signatureVersion: "v4" })
  ){}
  
  async getAllTodosByUser(userId) {
    logger.info("Start getAllTodos");
    const result = await this.dynamoDbClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      }).promise();
    logger.info("End getAllTodos");
  
    return result.Items;
  }

  async createTodo(todo) {
    logger.info("Start createTodo");
    await this.dynamoDbClient
      .put({
        TableName: this.todosTable,
        Item: todo,
      });
    logger.info("End createTodo");
  }

  async updateTodo(userId, todoId, todoUpdate) {
    logger.info("Start updateTodo");
    await this.dynamoDbClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
      });
      logger.info("End updateTodo");
  }

  async deleteTodo(userId, todoId) {
    logger.info("Start deleteTodo");
    await this.dynamoDbClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId,
        },
      });
    logger.info("End deleteTodo");
  }

  async getUploadUrl(userId, todoId) {
    logger.info("Start getUploadUrl");
    const uploadUrl = this.s3Client.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(urlExpiration),
    });
    await this.dynamoDbClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: "set attachmentUrl = :URL",
        ExpressionAttributeValues: {
          ":URL": uploadUrl.split("?")[0],
        },
      })
    logger.info("End getUploadUrl");
    return uploadUrl;
  }
}