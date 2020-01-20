import Relay from 'react-relay/classic';

const checkSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
    team {
      slug
      search_id,
      permissions,
      search { id, number_of_results },
      check_search_trash { id, number_of_results },
      verification_statuses,
      medias_count,
    }
    medias(first: $pageSize) {
      edges {
        node {
          id,
          dbid,
          picture,
          title,
          description,
          virality,
          demand,
          linked_items_count,
          type,
          status,
          first_seen: created_at,
          last_seen,
          verification_statuses,
          project_id,
          project_ids,
          pusher_channel,
          permissions,
          project {
            id,
            dbid,
            search_id,
            search { id, number_of_results },
            medias_count,
          },
        }
      }
    },
    number_of_results
  }
`;

module.exports = checkSearchResultFragment;
