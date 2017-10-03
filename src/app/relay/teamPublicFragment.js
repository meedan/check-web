import Relay from 'react-relay';

const teamPublicFragment = Relay.QL`
  fragment on PublicTeam {
      name,
      dbid,
      private,
      slug
    }
`;

module.exports = teamPublicFragment;
