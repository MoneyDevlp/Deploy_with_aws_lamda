import middy from '@middy/core'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs';
import { updateTodo } from "../../services/todosAccess";
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('updateTodo');

export const handle = middy()
.use(
  cors({
    credentials: true
  })
).handler(async (event) => {
    try {
      const userId = getUserId(event.headers.Authorization);
      const todoId = event.pathParameters.todoId;
      const { name, done } = JSON.parse(event.body);
      const todoUpdate = await updateTodo(userId, todoId, {name,done, dueDate: new Date().toISOString()});
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ item: todoUpdate }),
      };
    } catch (error) {
      logger.error("Update todo error: ", error);
    }
})

