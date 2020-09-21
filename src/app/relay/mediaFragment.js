import Relay from 'react-relay/classic';

const mediaFragment = Relay.QL`
  fragment on ProjectMedia {
    id,
    dbid,
    url,
    quote,
    title,
    type,
    published,
    created_at,
    updated_at,
    last_seen,
    share_count,
    archived,
    relationships { sources_count, targets_count },
    relationship {
      id
      permissions
      source { id, dbid }
      source_id
      target { id, dbid }
      target_id
    }
    log_count,
    project_ids,
    pusher_channel,
    domain,
    permissions,
    language,
    language_code,
    last_status,
    last_status_obj {
      id,
      dbid,
      locked,
      content,
      assignments(first: 10000) {
        edges {
          node {
            id
            dbid
            name
            source {
              id
              dbid
              image
            }
          }
        }
      }
    }
    media {
      type,
      metadata,
      url,
      quote,
      embed_path,
      file_path,
      thumbnail_path
    }
    user {
      dbid,
      name,
      source {
        dbid,
        image,
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
      get_status_target_turnaround
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
`;

export default mediaFragment;
