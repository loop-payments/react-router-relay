import type { EntryPoint } from "react-relay";
type TodoApp = typeof import("../components/TodoApp").default;
import TodoAppQuery from "../../__generated__/relay/TodoAppQuery.graphql";
import {JSResource} from "@loop-payments/react-router-relay";
type Params = {
  userId: string;
};
const TodoAppEntryPoint: EntryPoint<TodoApp, Params> = {
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
  '../components/TodoApp') as any) as Promise<TodoApp>))
};
export default TodoAppEntryPoint;