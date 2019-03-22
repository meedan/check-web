import Relay from 'react-relay/classic';

const checkSearchResultFragment = Relay.QL`
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
          url,
          quote,
          published,
          updated_at,
          embed,
          archived,
          relationships { sources_count, targets_count },
          assignments_progress,
          log_count,
          verification_statuses,
          overridden,
          project_id,
          pusher_channel,
          domain,
          permissions,
          deadline: field_value(annotation_type_field_name: "verification_status:deadline"),
          last_status,
          last_status_obj {
            id,
            dbid,
            locked
          }
          project {
            id,
            dbid,
            search_id,
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
            embed,
            url,
            quote,
            embed_path,
            thumbnail_path
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
                  embed,
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
