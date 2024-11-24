import middy from '@middy/core'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs';
import { getAllTodosByUser } from "../../services/todosAccess";
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('getTodos');

export const handle = middy()
.use(
  cors({
    credentials: true
  })
).handler(async (event) => {
    try {
      const userId = getUserId(event.headers.Authorization);
      const todosList = await getAllTodosByUser(userId);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ items: todosList }),
      };
    } catch (error) {
      logger.error("Get todos error: ", error);
    }
})
