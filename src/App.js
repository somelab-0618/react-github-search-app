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

  const getResultTitle = (data) => {
    const repositoryCount = data.search.repositoryCount;
    const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';

    return `Githubリポジトリ検索結果: ${repositoryCount} ${repositoryUnit}`;
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

          return (
            <>
              <h2>{getResultTitle(data)}</h2>
              <ul>
                {data.search.edges.map((edge) => {
                  const node = edge.node;
                  return (
                    <li key={node.id}>
                      <a href={node.url} target='_blank' rel='noreferrer'>
                        {node.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          );
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
