import Relay from 'react-relay';

var teamFragment = Relay.QL`
  fragment on Team {
    id,
    dbid,
    name,
    description,
    subdomain,
    team_users(first: 6) {
      edges {
        node {
          user{name,profile_image},status,team_id,user_id,id

        }
      }
    },
    contacts(first: 1) {
      edges {
        node {
          location,
          web,
          phone,
          id

        }
      }
    }
  }
`;

module.exports = teamFragment;
