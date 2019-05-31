import Relay from 'react-relay/classic';

const checkDenseSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
    team {
      slug
      search_id,
      get_embed_whitelist
      get_suggested_tags
      get_status_target_turnaround
      team_bot_installations(first: 10000) {
        edges {
          node {
            team_bot {
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
          domain,
          metadata,
          quote,
          overridden,
          relationships { sources_count, targets_count },
          relationship { id, dbid, source_id, target_id },
          verification_statuses,
          project_id,
          permissions,
          last_status,
          last_status_obj {
            id,
            dbid,
            content,
            locked
          }
          media {
            url,
            metadata,
            quote,
            picture
            thumbnail_path
          }
        }
      }
    },
    number_of_results
  }
`;

module.exports = checkDenseSearchResultFragment;
