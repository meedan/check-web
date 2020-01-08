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
            team_bot: bot_user {
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
          published,
          updated_at,
          overridden,
          relationships { sources_count, targets_count },
          relationship { id, dbid, source_id, target_id },
          verification_statuses,
          project_id,
          project_ids,
          permissions,
          last_status,
          last_status_obj {
            id,
            dbid,
            content,
            locked
          }
          media {
            type,
            url,
            metadata,
            quote,
            picture
            thumbnail_path
          }
        }
      }
    },
    sources(first: $pageSize) {
      edges {
        node {
          id,
          dbid,
          team {
            slug
          },
          project_id,
          published,
          updated_at,
          source {
            id,
            dbid,
            name,
            image,
            accounts(first: 10000) {
              edges {
                node {
                  id,
                  provider,
                  url
                }
              }
            }
          }
        }
      }
    },
    number_of_results
  }
`;

module.exports = checkDenseSearchResultFragment;
