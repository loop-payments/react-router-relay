/* graphql-relay doesn't export types, and isn't in flow-typed.  This gets too messy */

/* eslint flowtype/require-return-type: 'off' */
import { mutationWithClientMutationId, fromGlobalId } from "graphql-relay";
import type { GraphQLFieldConfig } from "graphql";
import { GraphQLID, GraphQLNonNull } from "graphql";
import { GraphQLUser } from "../nodes";
import { getUserOrThrow, removeTodo, User } from "../../database";
type Input = {
  readonly id: string;
  readonly userId: string;
};
type Payload = {
  readonly id: string;
  readonly userId: string;
};
const RemoveTodoMutation: GraphQLFieldConfig<any, any> = mutationWithClientMutationId({
  name: 'RemoveTodo',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    deletedTodoId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({
        id
      }: Payload): string => id
    },
    user: {
      type: new GraphQLNonNull(GraphQLUser),
      resolve: ({
        userId
      }: Payload): User => getUserOrThrow(userId)
    }
  },
  mutateAndGetPayload: ({
    id,
    userId
  }: Input): Payload => {
    const localTodoId = fromGlobalId(id).id;
    removeTodo(localTodoId);
    return {
      id,
      userId
    };
  }
});
export { RemoveTodoMutation };