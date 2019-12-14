import Relay from 'react-relay/classic';

const teamPublicFragment = Relay.QL`
  fragment on PublicTeam {
      name,
      avatar,
      dbid,
      private,
      slug,
      team_graphql_id,
      verification_statuses,
      translation_statuses,
    }
`;

module.exports = teamPublicFragment;
