/* graphql-relay doesn't export types, and isn't in flow-typed.  This gets too messy */

/* eslint flowtype/require-return-type: 'off' */
import { mutationWithClientMutationId } from "graphql-relay";
import type { GraphQLFieldConfig } from "graphql";
import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull } from "graphql";
import { GraphQLTodo, GraphQLUser } from "../nodes";
import { getTodoOrThrow, getUserOrThrow, markAllTodos, Todo, User } from "../../database";
type Input = {
  readonly complete: boolean;
  readonly userId: string;
};
type Payload = {
  readonly changedTodoIds: ReadonlyArray<string>;
  readonly userId: string;
};
const MarkAllTodosMutation: GraphQLFieldConfig<any, any> = mutationWithClientMutationId({
  name: 'MarkAllTodos',
  inputFields: {
    complete: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    changedTodos: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLTodo)),
      resolve: ({
        changedTodoIds
      }: Payload): ReadonlyArray<Todo> => changedTodoIds.map((todoId: string): Todo => getTodoOrThrow(todoId))
    },
    user: {
      type: new GraphQLNonNull(GraphQLUser),
      resolve: ({
        userId
      }: Payload): User => getUserOrThrow(userId)
    }
  },
  mutateAndGetPayload: ({
    complete,
    userId
  }: Input): Payload => {
    const changedTodoIds = markAllTodos(complete);
    return {
      changedTodoIds,
      userId
    };
  }
});
export { MarkAllTodosMutation };