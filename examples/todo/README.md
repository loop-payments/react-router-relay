# Relay TodoMVC

This is based on the example from https://github.com/relayjs/relay-examples/tree/main/todo.

## Installation

```
yarn
```

## Running

Set up generated files:

```
yarn update-schema
yarn build
```

Start a local server:

```
yarn start
```

## Developing

Any changes you make to files in the `src/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.graphql`, and restart the server:

```
yarn update-schema
yarn build
yarn start
```
