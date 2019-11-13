import Relay from 'react-relay/classic';

const bridgeDenseSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
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
          translation_statuses,
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
            picture
          }
          team {
            slug
            search_id,
            get_status_target_turnaround
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

module.exports = bridgeDenseSearchResultFragment;
