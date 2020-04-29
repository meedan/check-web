import Relay from 'react-relay/classic';

const teamPublicFragment = Relay.QL`
  fragment on PublicTeam {
      id,
      name,
      avatar,
      dbid,
      private,
      slug,
      team_graphql_id,
      verification_statuses,
      trash_count,
      pusher_channel,
    }
`;

export default teamPublicFragment;
