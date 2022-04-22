import React, { useState } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import client from './client';
import { ADD_STAR, SEARCH_REPOSITORIES } from './graphql';

const StarButton = (props) => {
  const node = props.node;
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const starCount = totalCount === 1 ? '1 STAR' : `${totalCount} STARS`;
  const StarStatus = ({ addStar }) => {
    return (
      <button
        onClick={() => {
          addStar({
            variables: { input: { starrableId: node.id } },
          });
        }}
      >
        {starCount} | {viewerHasStarred ? '★' : '☆'}
      </button>
    );
  };

  return (
    <Mutation mutation={ADD_STAR}>
      {(addStar) => <StarStatus addStar={addStar} />}
    </Mutation>
  );
};

const PER_PAGE = 5;
const DEFAULT_STATE = {
  after: null,
  before: null,
  first: PER_PAGE,
  last: null,
  query: 'フロントエンドエンジニア',
};

const App = () => {
  const [variables, setVariables] = useState(DEFAULT_STATE); // eslint-disable-next-line

  const handleChange = (e) => {
    setVariables({
      ...DEFAULT_STATE,
      query: e.target.value,
    });
  };

  const getResultTitle = (data) => {
    const repositoryCount = data.search.repositoryCount;
    const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';

    return `Githubリポジトリ検索結果: ${repositoryCount} ${repositoryUnit}`;
  };

  const goNext = (search) => {
    setVariables({
      ...variables,
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null,
    });
  };
  const goPrev = (search) => {
    setVariables({
      ...variables,
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
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
          const search = data.search;

          return (
            <>
              <h2>{getResultTitle(data)}</h2>
              <ul>
                {search.edges.map((edge) => {
                  const node = edge.node;
                  return (
                    <li key={node.id}>
                      <a href={node.url} target='_blank' rel='noreferrer'>
                        {node.name}
                      </a>
                      &nbsp; &nbsp;
                      <StarButton node={node} />
                    </li>
                  );
                })}
              </ul>
              {search.pageInfo.hasPreviousPage && (
                <button onClick={() => goPrev(search)}>Prev</button>
              )}
              {search.pageInfo.hasNextPage && (
                <button onClick={() => goNext(search)}>NEXT</button>
              )}
            </>
          );
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
