import React, { useState, useRef } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import client from './client';
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql';

const StarButton = (props) => {
  const { node, variables } = props;
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const starCount = totalCount === 1 ? '1 STAR' : `${totalCount} STARS`;
  const StarStatus = ({ handleStar }) => {
    return (
      <button
        onClick={() => {
          handleStar({
            variables: { input: { starrableId: node.id } },
            update: (store, { data: { addStar, removeStar } }) => {
              const { starrable } = addStar || removeStar;
              const data = store.readQuery({
                query: SEARCH_REPOSITORIES,
                variables: { ...variables },
              });
              let edges = data.search.edges;
              const newEdges = edges.map((edge) => {
                if (edge.node.id === node.id) {
                  const totalCount = edge.node.stargazers.totalCount;
                  // const diff = viewerHasStarred ? -1 : 1;
                  const diff = starrable.viewerHasStarred ? -1 : 1;

                  const newTotalCount = totalCount + diff;
                  edge.node.stargazers.totalCount = newTotalCount;
                }
                return edge;
              });
              edges = newEdges;
              store.writeQuery({ query: SEARCH_REPOSITORIES, data });
            },
          });
        }}
      >
        {starCount} | {viewerHasStarred ? '★' : '☆'}
      </button>
    );
  };

  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}>
      {(handleStar) => <StarStatus handleStar={handleStar} />}
    </Mutation>
  );
};

const PER_PAGE = 5;
const DEFAULT_STATE = {
  after: null,
  before: null,
  first: PER_PAGE,
  last: null,
  query: '',
};

const App = () => {
  const [variables, setVariables] = useState(DEFAULT_STATE); // eslint-disable-next-line
  const el = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(el.current.value);

    setVariables({
      ...DEFAULT_STATE,
      query: el.current.value,
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
      <form onSubmit={handleSubmit}>
        <input type='text' ref={el} />
        <input type='submit' value='検索' />
      </form>
      <Query query={SEARCH_REPOSITORIES} variables={variables}>
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
                      <StarButton node={node} variables={{ ...variables }} />
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
