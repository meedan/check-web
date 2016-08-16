import Relay from 'react-relay';

var teamFragment = Relay.QL`
  fragment on Team {
    id,
    name,
    description,
    users(first: 6) {
      edges {
        node {
          name,
          profile_image
        }
      }
    },
  }
`;

module.exports = teamFragment;
