import gql from 'graphql-tag';
import { User } from '../models/user.model';

export interface AllUsersQuery {
  allUsers: User[];
}

export const ALL_USERS_QUERY = gql`
  query AlUsersQuery {
  allUsers(
    orderBy: name_DESC
  ) {
    id
    name
    email
    createdAt
  }
}
`;
