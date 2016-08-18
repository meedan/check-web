import Relay from 'react-relay';

var teamFragment = Relay.QL`
  fragment on Team {
    id,
    name,
    description,
    subdomain,
    team_users(first: 6) {
      edges {
        node {
          user{name,profile_image},status

        }
      }
    },
  }
`;

module.exports = teamFragment;
