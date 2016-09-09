import Relay from 'react-relay';

var teamFragment = Relay.QL`
  fragment on Team {
    id,
    dbid,
    name,
    avatar,
    description,
    subdomain,
    team_users(first: 6) {
      edges {
        node {
          user{name,profile_image},status,team_id,user_id,id,role

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
    },
    projects(first: 20) {
      edges {
        node {
          title,
          dbid,
          id,
          description
        }
      }
    }
  }
`;

module.exports = teamFragment;
