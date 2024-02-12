import TodoAppQuery from '../../__generated__/relay/TodoAppQuery.graphql';
import {JSResource, SimpleEntryPoint} from '@loop-payments/react-router-relay';

type TodoApp = typeof import('../components/TodoApp').default;

// TODO: How to type the params?
// type Params = {
//   userId: string;
// };

const TodoAppEntryPoint: SimpleEntryPoint<TodoApp> = {
  getPreloadProps({params}) {
    return {
      queries: {
        todoAppQueryRef: {
          parameters: {
            kind: 'PreloadableConcreteRequest',
            params: TodoAppQuery.params,
          },
          variables: {
            userId: params?.userId ?? 'me',
          },
        },
      },
    };
  },

  root: JSResource<TodoApp>('TodoApp', () => ((import(
    /* webpackPrefetch: true */
    '../components/TodoApp') as any) as Promise<TodoApp>)),
};

export default TodoAppEntryPoint;