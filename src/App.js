import React, { useState } from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES } from './graphql';

const VARIABLES = {
  after: null,
  before: null,
  first: 5,
  last: null,
  query: 'フロントエンドエンジニア',
};

const App = () => {
  const [variables] = useState(VARIABLES); // eslint-disable-next-line

  return (
    <ApolloProvider client={client}>
      <Query query={SEARCH_REPOSITORIES} variables={{ ...variables }}>
        {({ loading, error, data }) => {
          if (loading) return 'loading...';
          if (error) return `Error ${error.message}`;
          console.log({ data });
          return <div></div>;
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
