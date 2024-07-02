/* graphql-relay doesn't export types, and isn't in flow-typed.  This gets too messy */

/* eslint flowtype/require-return-type: 'off' */
import { mutationWithClientMutationId, toGlobalId } from "graphql-relay";
import type { GraphQLFieldConfig } from "graphql";
import { GraphQLID, GraphQLList, GraphQLNonNull } from "graphql";
import { GraphQLUser } from "../nodes";
import { getUserOrThrow, removeCompletedTodos, User } from "../../database";
type Input = {
  readonly userId: string;
};
type Payload = {
  readonly deletedTodoIds: ReadonlyArray<string>;
  readonly userId: string;
};
const RemoveCompletedTodosMutation: GraphQLFieldConfig<any, any> = mutationWithClientMutationId({
  name: 'RemoveCompletedTodos',
  inputFields: {
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    deletedTodoIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      resolve: ({
        deletedTodoIds
      }: Payload): ReadonlyArray<string> => deletedTodoIds
    },
    user: {
      type: new GraphQLNonNull(GraphQLUser),
      resolve: ({
        userId
      }: Payload): User => getUserOrThrow(userId)
    }
  },
  mutateAndGetPayload: ({
    userId
  }: Input): Payload => {
    const deletedTodoLocalIds = removeCompletedTodos();
    const deletedTodoIds = deletedTodoLocalIds.map(toGlobalId.bind(null, 'Todo'));
    return {
      deletedTodoIds,
      userId
    };
  }
});
export { RemoveCompletedTodosMutation };