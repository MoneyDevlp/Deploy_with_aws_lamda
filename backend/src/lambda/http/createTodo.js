import middy from '@middy/core'
import cors from '@middy/http-cors'
import { getUserId } from '../utils.mjs';
import { createTodo } from "../../services/todosAccess";
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('createTodo');

export const handle = middy()
.use(
  cors({
    credentials: true
  })
).handler(async (event) => {
    try {
      const userId = getUserId(event.headers.Authorization);
      const { name, dueDate } = JSON.parse(event.body);
      const newTodo = await createTodo({userId, name, dueDate});
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ item: newTodo }),
      };
    } catch (error) {
      logger.error("Create todo error: ", error);
    }
})

