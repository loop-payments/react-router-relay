import type { GraphQLInterfaceType, GraphQLFieldConfig, GraphQLFieldConfigArgumentMap } from "graphql";
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { connectionArgs, connectionDefinitions, connectionFromArray, fromGlobalId, globalIdField, nodeDefinitions } from "graphql-relay";
import { Todo, User, USER_ID, getTodoOrThrow, getTodos, getUserOrThrow } from "../database";

const {
  nodeInterface,
  nodeField
} = (nodeDefinitions((globalId: string): {} | null | undefined => {
  const {
    type,
    id
  }: {
    id: string;
    type: string;
  } = fromGlobalId(globalId);

  if (type === 'Todo') {
    return (getTodoOrThrow(id) as any);
  } else if (type === 'User') {
    return (getUserOrThrow(id) as any);
  }

  return null;
}, (obj: {}): string | undefined => {
  if (obj instanceof Todo) {
    return GraphQLTodo.name;
  } else if (obj instanceof User) {
    return GraphQLUser.name;
  }
}) as {
  nodeField: GraphQLFieldConfig<any, any>;
  nodeInterface: GraphQLInterfaceType;
  nodesField: GraphQLFieldConfig<any, any>;
});

const GraphQLTodo: GraphQLObjectType = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    id: globalIdField('Todo'),
    text: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (todo: Todo): string => todo.text
    },
    complete: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (todo: Todo): boolean => todo.complete
    }
  },
  interfaces: [nodeInterface]
});

const {
  connectionType: TodosConnection,
  edgeType: GraphQLTodoEdge
} = (connectionDefinitions({
  name: 'Todo',
  nodeType: GraphQLTodo
}) as {
  connectionType: GraphQLObjectType;
  edgeType: GraphQLObjectType;
});

const todosArgs: GraphQLFieldConfigArgumentMap = {
  status: {
    type: GraphQLString,
    defaultValue: 'any'
  },
  ...connectionArgs
};

const GraphQLUser: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    userId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (): string => USER_ID
    },
    todos: {
      type: TodosConnection,
      args: todosArgs,
      // eslint-disable-next-line flowtype/require-parameter-type
      resolve: (root: {}, {
        status,
        after,
        before,
        first,
        last
      }) => connectionFromArray([...getTodos(status)], {
        after,
        before,
        first,
        last
      })
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (): number => getTodos().length
    },
    completedCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (): number => getTodos('completed').length
    }
  },
  interfaces: [nodeInterface]
});

export { nodeField, GraphQLTodo, GraphQLTodoEdge, GraphQLUser };