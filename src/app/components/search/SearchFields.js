import Relay from 'react-relay/classic';
import CustomTeamTaskFilter from './CustomTeamTaskFilter';
import SearchFieldsComponent from './SearchFieldsComponent';

export default Relay.createContainer(SearchFieldsComponent, {
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
        dynamic_search_fields_json_schema
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
