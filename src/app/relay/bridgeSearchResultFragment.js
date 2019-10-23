import Relay from 'react-relay/classic';

const bridgeSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
    team {
      slug
      search_id,
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
          translation_statuses,
          overridden,
          project_id,
          pusher_channel,
          language,
          language_code,
          domain,
          permissions,
          last_status,
          field_value(annotation_type_field_name: "translation_status:translation_status_status"),
          translation_status: annotation(annotation_type: "translation_status") {
            id
            dbid
          }
          last_status_obj {
            id,
            dbid,
            content,
            locked
          }
          project {
            id,
            dbid,
            search_id,
            search { id, number_of_results },
            title
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
            thumbnail_path
            picture
          }
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
          team {
            slug
            search_id,
            get_embed_whitelist
            get_suggested_tags
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

module.exports = bridgeSearchResultFragment;
