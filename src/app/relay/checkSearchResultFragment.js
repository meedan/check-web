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
          url,
          quote,
          published,
          updated_at,
          metadata,
          title,
          archived,
          relationships { sources_count, targets_count },
          relationship { id, dbid, source_id, target_id },
          assignments_progress,
          log_count,
          verification_statuses,
          overridden,
          project_id,
          project_ids,
          pusher_channel,
          domain,
          permissions,
          last_status,
          last_status_obj {
            id,
            dbid,
            locked,
            content
          }
          project {
            id,
            dbid,
            search_id,
            search { id, number_of_results },
            title,
            medias_count,
          },
          project_source {
            dbid,
            project_id,
            source {
              name
            }
          },
          media {
            type,
            metadata,
            url,
            quote,
            embed_path,
            thumbnail_path,
            file_path,
            picture
          }
          tags(first: 10000) {
            edges {
              node {
                tag,
                tag_text,
                id
              }
            }
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
            dbid,
            slug
          },
          project_id,
          published,
          updated_at,
          source_id,
          source {
            id,
            dbid,
            name,
            description,
            permissions,
            image,
            accounts(first: 10000) {
              edges {
                node {
                  id,
                  data,
                  metadata,
                  provider,
                  url
                }
              }
            }
          },
          user {
            dbid,
            name,
            source {
              dbid,
              accounts(first: 10000) {
                edges {
                  node {
                    url
                  }
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

module.exports = checkSearchResultFragment;
