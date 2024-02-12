import express from "express";
import { graphqlHTTP } from "express-graphql";
import { persistedQueries } from "express-graphql-persisted-queries";
import fs from "fs";
import path from "path";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import { schema } from "./data/schema";

const APP_PORT: number = 3000;
const QUERY_MAP_FILE: string = path.resolve(__dirname, '__generated__', 'queries.json');

// Serve the Relay app
// Calling webpack() without a callback as 2nd property returns a Compiler object.
const compiler = webpack({
  mode: 'development',
  entry: [
    'whatwg-fetch',
    'webpack-hot-middleware/client',
    path.resolve(__dirname, 'src', 'App.tsx'),
    path.resolve(__dirname, 'src', 'components', 'TodoApp.tsx')
  ],
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'App.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshPlugin()
  ],
  stats: {
    colors: true
  }
});

const app = express();

app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}));

app.use(webpackHotMiddleware(compiler));

// Serve static resources
app.use(express.static(path.resolve(__dirname, 'public')));

// todo-common loads learn.json from a relative URL
app.use('*/learn.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'learn.json'));
});

// Setup GraphQL endpoint
const queryMap = JSON.parse(fs.readFileSync(QUERY_MAP_FILE, 'utf8'));
app.use('/graphql', persistedQueries({
  queryMap
}), graphqlHTTP({
  schema: schema,
  pretty: true
}));

// Handle any other route by react-router
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(APP_PORT, "localhost", () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});