import Relay from 'react-relay/classic';
import sourceFragment from './sourceFragment';

const userFragment = Relay.QL`
  fragment on User {
    id,
    dbid,
    name,
    email,
    is_active,
    profile_image,
    number_of_teams,
    source {
      ${sourceFragment}
    }
  }
`;

export default userFragment;
