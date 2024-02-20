/* graphql-relay doesn't export types, and isn't in flow-typed.  This gets too messy */

/* eslint flowtype/require-return-type: 'off' */
import { mutationWithClientMutationId, fromGlobalId } from "graphql-relay";
import type { GraphQLFieldConfig } from "graphql";
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQLTodo } from "../nodes";
import { getTodoOrThrow, renameTodo, Todo } from "../../database";
type Input = {
  readonly id: string;
  readonly text: string;
};
type Payload = {
  readonly localTodoId: string;
};
const RenameTodoMutation: GraphQLFieldConfig<any, any> = mutationWithClientMutationId({
  name: 'RenameTodo',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    text: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  outputFields: {
    todo: {
      type: new GraphQLNonNull(GraphQLTodo),
      resolve: ({
        localTodoId
      }: Payload): Todo => getTodoOrThrow(localTodoId)
    }
  },
  mutateAndGetPayload: ({
    id,
    text
  }: Input): Payload => {
    const localTodoId = fromGlobalId(id).id;
    renameTodo(localTodoId, text);
    return {
      localTodoId
    };
  }
});
export { RenameTodoMutation };