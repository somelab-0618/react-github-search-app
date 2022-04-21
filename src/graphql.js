import gql from 'graphql-tag';

export const ME = gql`
  query me {
    user(login: "somelab-0618") {
      name
      avatarUrl
    }
  }
`;
