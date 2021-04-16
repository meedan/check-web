import Relay from 'react-relay/classic';
import SearchKeywordComponent from './SearchKeywordComponent';

export default Relay.createContainer(SearchKeywordComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        verification_statuses
        pusher_channel
        name
        slug
        projects(first: 10000) {
          edges {
            node {
              title
              dbid
              id
            }
          }
        }
      }
    `,
  },
});
