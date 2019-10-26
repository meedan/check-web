import Relay from 'react-relay/classic';

const teamPublicFragment = Relay.QL`
  fragment on PublicTeam {
      name,
      avatar,
      dbid,
      private,
      slug,
      team_graphql_id,
    }
`;

module.exports = teamPublicFragment;
