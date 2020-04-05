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
      team_bot_installations(first: 10000) {
        edges {
          node {
            id
            team_bot: bot_user {
              id
              identifier
            }
          }
        }
      }
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
          share_count,
          project_id,
          verification_statuses,
        }
      }
    },
    number_of_results
  }
`;

export default checkSearchResultFragment;
