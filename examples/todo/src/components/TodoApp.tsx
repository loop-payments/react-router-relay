import type {TodoAppQuery} from '../../__generated__/relay/TodoAppQuery.graphql';
import {graphql, usePreloadedQuery} from 'react-relay';
import TodoList from './TodoList';
import * as React from 'react';
import {SimpleEntryPointProps} from '@loop-payments/react-router-relay';

type PreloadedQueries = {
  todoAppQueryRef: TodoAppQuery;
};
type Props = SimpleEntryPointProps<PreloadedQueries>;

function TodoApp({queries}: Props): React.ReactNode {
  const {user} = usePreloadedQuery<TodoAppQuery>(graphql`
      query TodoAppQuery($userId: String!, $status: String) @preloadable {
        user(id: $userId) @required(action: THROW) {
          ...TodoList_user
        }
      }
    `, queries.todoAppQueryRef);

  return <div>
    <section className="todoapp">
      <TodoList userRef={user} />
    </section>

    <footer className="info">
      <p>Double-click to edit a todo</p>

      <p>
        Created by the{' '}
        <a href="https://facebook.github.io/relay/">Relay team</a>
      </p>

      <p>
        Part of <a href="http://todomvc.com">TodoMVC</a>
      </p>
    </footer>
  </div>;
}

export default TodoApp;
