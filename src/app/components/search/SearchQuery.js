import Relay from 'react-relay/classic';
import SearchQueryComponent from './SearchQueryComponent';

export default Relay.createContainer(SearchQueryComponent, {
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
      }
    `,
  },
});
