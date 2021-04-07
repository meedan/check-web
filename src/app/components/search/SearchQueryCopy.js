import Relay from 'react-relay/classic';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';
import SearchQueryComponentCopy from './SearchQueryComponentCopy';

export default Relay.createContainer(SearchQueryComponentCopy, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        verification_statuses
        tag_texts(first: 10000) {
          edges {
            node {
              text
            }
          }
        }
        pusher_channel
        dynamic_search_fields_json_schema
        rules_search_fields_json_schema
        name
        slug
        projects(first: 10000) {
          edges {
            node {
              title
              dbid
              id
              description
            }
          }
        }
        users(first: 10000) {
          edges {
            node {
              id
              dbid
              name
            }
          }
        }
        ${CustomTeamTaskFilter.getFragment('team')}
      }
    `,
  },
});
