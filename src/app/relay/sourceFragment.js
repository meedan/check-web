import Relay from 'react-relay/classic';

const sourceFragment = Relay.QL`
  fragment on Source {
    id,
    dbid,
    created_at,
    updated_at,
    name,
    image,
    user_id,
    description,
    permissions,
    verification_statuses,
    accounts(first: 10000) {
      edges {
        node {
          url,
          provider
        }
      }
    },
    account_sources(first: 10000) {
      edges {
        node {
          id,
          account {
            id,
            created_at,
            updated_at,
            metadata,
            url,
            uid,
            user_id,
            provider,
          }
        }
      }
    },
    tags(first: 10000) {
      edges {
        node {
          tag,
          tag_text,
          id
        }
      }
    },
    medias(first: 10000) {
      edges {
        node {
          id,
          dbid,
          url,
          published,
          metadata,
          log_count,
          domain,
          last_status,
          media,
          permissions,
          project_id,
          archived,
          relationships { sources_count, targets_count },
          id,
          dbid,
          quote,
          published,
          url,
          metadata,
          last_status,
          log_count,
          domain,
          permissions,
          project {
            id,
            dbid,
            title
          },
          project_id,
          pusher_channel,
          verification_statuses,
          overridden,
          language,
          language_code,
          media {
            type,
            url,
            quote,
            embed_path,
            file_path,
            thumbnail_path
          }
          user {
            dbid,
            name,
            email,
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
          last_status_obj {
            id
            dbid
            content
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
          tags(first: 10000) {
            edges {
              node {
                tag,
                tag_text,
                id
              }
            }
          }
          tasks(first: 10000) {
            edges {
              node {
                id,
                dbid,
                label,
                type,
                description,
                permissions,
                jsonoptions,
                first_response {
                  id,
                  dbid,
                  permissions,
                  content,
                  annotator {
                    name
                  }
                }
              }
            }
          }
          log(first: 10000) {
            edges {
              node {
                id,
                dbid,
                item_type,
                item_id,
                event,
                event_type,
                created_at,
                object_after,
                object_changes_json,
                meta,
                projects(first: 2) {
                  edges {
                    node {
                      id,
                      dbid,
                      title
                    }
                  }
                }
                user {
                  dbid,
                  name,
                  profile_image,
                  email,
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
                task {
                  id,
                  dbid,
                  label,
                  type
                }
                annotation {
                  id,
                  dbid,
                  content,
                  annotation_type,
                  updated_at,
                  created_at,
                  permissions,
                  medias(first: 10000) {
                    edges {
                      node {
                        id,
                        dbid,
                        quote,
                        published,
                        url,
                        metadata,
                        project_id,
                        last_status,
                        log_count,
                        permissions,
                        verification_statuses,
                        domain,
                        team {
                          slug
                          get_languages
                        }
                        media {
                          type,
                          embed_path,
                          thumbnail_path,
                          file_path,
                          url,
                          quote
                        }
                        user {
                          name,
                          source {
                            dbid
                          }
                        }
                      }
                    }
                  }
                  annotator {
                    name,
                    profile_image
                  }
                  version {
                    id
                    item_id
                    item_type
                  }
                }
              }
            }
          }
          team {
            get_suggested_tags,
            get_languages,
            slug
          }
        }
      }
    }
  }
`;

export default sourceFragment;
