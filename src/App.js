import React, { useState } from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES } from './graphql';

const DEFAULT_STATE = {
  after: null,
  before: null,
  first: 5,
  last: null,
  query: 'フロントエンドエンジニア',
};

const App = () => {
  const [variables, setVariavles] = useState(DEFAULT_STATE); // eslint-disable-next-line

  const handleChange = (e) => {
    setVariavles({
      ...DEFAULT_STATE,
      query: e.target.value,
    });
  };

  return (
    <ApolloProvider client={client}>
      <form>
        <input type='text' value={variables.query} onChange={handleChange} />
      </form>
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
