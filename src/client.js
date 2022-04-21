import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

// リクエストヘッダーの設定
const headersLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });
  return forward(operation);
});

// エンドポイントの設定
const endpoint = 'https://api.github.com/graphql';
const httpLink = new HttpLink({ uri: endpoint });
// ヘッダーとエンドポイントの結合
const link = ApolloLink.from([headersLink, httpLink]);

export default new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
