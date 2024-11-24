import middy from '@middy/core'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs';
import { getUploadUrl } from "../../services/todosAccess";
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('generateUploadUrl');

export const handle = middy()
.use(
  cors({
    credentials: true
  })
).handler(async (event) => {
    try {
      const userId = getUserId(event.headers.Authorization);
      const todoId = event.pathParameters.todoId;
      const uploadUrl = await getUploadUrl(userId, todoId);
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({uploadUrl: uploadUrl}),
      };
    } catch (error) {
      logger.error("UploadUrl error: ", error);
    }
})

