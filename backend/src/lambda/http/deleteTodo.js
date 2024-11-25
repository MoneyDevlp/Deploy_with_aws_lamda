import middy from '@middy/core'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs';
import { deleteTodo } from "../../services/todosAccess";
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('deleteTodo');

export const handle = middy()
.use(
  cors({
    credentials: true
  })
).handler(async (event) => {
    try {
      const userId = getUserId(event.headers.Authorization);
      const todoId = event.pathParameters.todoId;
      await deleteTodo(userId, todoId);
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: "",
      };
    } catch (error) {
      logger.error("Delete todo error: ", error);
    }
})

