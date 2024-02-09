import type { EntryPoint } from "react-relay";
type TodoApp = typeof import("../components/TodoApp").default;
import JSResource from "../utilities/JSResource";
import TodoAppQuery from "../../__generated__/relay/TodoAppQuery.graphql";
type Params = {
  userId: string;
};
const TodoAppEntryPoint: EntryPoint<Params, TodoApp> = {
  getPreloadProps({
    userId
  }: Params) {
    return {
      queries: {
        todoAppQueryRef: {
          parameters: {
            kind: 'PreloadableConcreteRequest',
            params: TodoAppQuery.params
          },
          variables: {
            userId
          }
        }
      }
    };
  },

  root: JSResource<TodoApp>('TodoApp', () => ((import(
  /* webpackPrefetch: true */
  '../components/TodoApp.js') as any) as Promise<TodoApp>))
};
export default TodoAppEntryPoint;