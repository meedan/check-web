import Relay from 'react-relay/classic';

const mediaFragment = Relay.QL`
  fragment on ProjectMedia {
    id,
    dbid,
    url,
    quote,
    published,
    updated_at,
    metadata,
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
    verification_statuses,
    overridden,
    project_id,
    project_ids,
    pusher_channel,
    domain,
    permissions,
    translation_statuses,
    language,
    language_code,
    field_value(annotation_type_field_name: "translation_status:translation_status_status"),
    translation_status: annotation(annotation_type: "translation_status") {
      id
      dbid
    }
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
      get_suggested_tags
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

module.exports = mediaFragment;
