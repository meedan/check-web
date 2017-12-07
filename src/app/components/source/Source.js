import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CheckContext from '../../CheckContext';
import SourceRoute from '../../relay/SourceRoute';
import SourceComponent from './SourceComponent';
import sourceFragment from '../../relay/sourceFragment';
import userFragment from '../../relay/userFragment';

const SourceContainer = Relay.createContainer(SourceComponent, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id,
        dbid,
        created_at,
        updated_at,
        source_id,
        project_id,
        project {
          get_languages
        },
        permissions,
        team {
          name,
          slug,
          get_suggested_tags,
        },
        source {
          id,
          dbid,
          created_at,
          updated_at,
          name,
          image,
          user_id,
          description,
          lock_version,
          permissions,
          pusher_channel,
          verification_statuses,
          metadata: annotations(annotation_type: "metadata", first: 1) {
            edges {
              node {
                id,
                dbid,
                annotation_type,
                annotated_type,
                annotated_id,
                annotator,
                content,
                created_at,
                updated_at,
                lock_version
              }
            }
          },
          languages: annotations(annotation_type: "language", first: 10000) {
            edges {
              node {
                id,
                dbid,
                annotation_type,
                annotated_type,
                annotated_id,
                annotator,
                content,
                created_at,
                updated_at
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
                  embed,
                  image,
                  url,
                  provider,
                  user {
                    dbid,
                    name,
                    email,
                    source {
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
            }
          },
          accounts(first: 10000) {
            edges {
              node {
                id,
                created_at,
                updated_at,
                embed,
                image,
                url,
                provider,
                user {
                  dbid,
                  name,
                  email,
                  source {
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
          tags(first: 10000) {
            edges {
              node {
                tag,
                id
              }
            }
          },
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
                  ${userFragment}
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
                        embed,
                        project_id,
                        last_status,
                        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                        log_count,
                        permissions,
                        verification_statuses,
                        translation_statuses,
                        domain,
                        team {
                          slug
                        }
                        media {
                          embed_path,
                          thumbnail_path,
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
          },
          medias(first: 10000) {
            edges {
              node {
                id,
                dbid,
                url,
                published,
                embed,
                log_count,
                domain,
                last_status,
                media,
                permissions,
                project_id,
                verification_statuses,
                archived,
                id,
                dbid,
                quote,
                published,
                url,
                embed,
                last_status,
                field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                log_count,
                domain,
                permissions,
                project {
                  id,
                  dbid,
                  title,
                  get_languages
                },
                project_id,
                pusher_channel,
                verification_statuses,
                translation_statuses,
                overridden,
                language,
                language_code,
                media {
                  url,
                  quote,
                  embed_path,
                  thumbnail_path
                }
                user {
                  dbid,
                  name,
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
                last_status_obj {
                  id
                  dbid
                }
                translation_status: annotation(annotation_type: "translation_status") {
                  id
                  dbid
                }
                translations: annotations(annotation_type: "translation", first: 10000) {
                  edges {
                    node {
                      id,
                      dbid,
                      annotation_type,
                      annotated_type,
                      annotated_id,
                      annotator,
                      content,
                      created_at,
                      updated_at
                    }
                  }
                }
                tags(first: 10000) {
                  edges {
                    node {
                      tag,
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
                              embed,
                              project_id,
                              last_status,
                              field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                              log_count,
                              permissions,
                              verification_statuses,
                              translation_statuses,
                              domain,
                              team {
                                slug
                              }
                              media {
                                embed_path,
                                thumbnail_path,
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
                  slug
                }
              }
            }
          }
        }
      }
    `,
  },
});

class Source extends Component {
  render() {
    let projectId = this.props.params.projectId || 0;
    const context = new CheckContext(this);
    context.setContext();
    if (projectId === 0) {
      const store = context.getContextStore();
      if (store.project) {
        projectId = store.project.dbid;
      }
    }

    const ids = `${this.props.params.sourceId},${projectId}`;
    const route = new SourceRoute({ ids });

    return (<Relay.RootContainer Component={SourceContainer} route={route} forceFetch />);
  }
}

Source.contextTypes = {
  store: React.PropTypes.object,
};

export default Source;
