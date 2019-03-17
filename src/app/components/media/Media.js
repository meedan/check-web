import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaParentComponent from './MediaParentComponent';
import MediasLoading from './MediasLoading';

const messages = defineMessages({
  confirmLeave: {
    id: 'media.confirmLeave',
    defaultMessage: '{count, plural, one {Are you sure you want to leave? You still have one required task assigned to you that is not answered} other {Are you sure you want to leave? You still have # required tasks assigned to you that are not answered}}',
  },
});

const MediaContainer = Relay.createContainer(MediaParentComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id,
        dbid,
        quote,
        published,
        archived,
        relationships { sources_count, targets_count },
        targets(first: 10000) {
          edges {
            node {
              id
              last_status
            }
          }
        },
        url,
        embed,
        last_status,
        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
        deadline: field_value(annotation_type_field_name: "verification_status:deadline"),
        log_count,
        domain,
        permissions,
        project {
          id,
          dbid,
          title,
          search_id,
          get_languages
        },
        project_id,
        project_source {
          dbid,
          project_id,
          source {
            name
          }
        },
        pusher_channel,
        verification_statuses,
        translation_statuses,
        overridden,
        language,
        language_code,
        dynamic_annotation_language {
          id
        }
        media {
          url,
          quote,
          embed,
          embed_path,
          thumbnail_path
        }
        user {
          dbid,
          name,
          email,
          is_active,
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
          locked
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
              status,
              required,
              description,
              permissions,
              jsonoptions,
              options,
              pending_suggestions_count,
              suggestions_count,
              log_count,
              responses(first: 10000) {
                edges {
                  node {
                    id,
                    dbid,
                    permissions,
                    content,
                    attribution(first: 10000) {
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
                    annotator {
                      name,
                      profile_image,
                      user {
                        id,
                        dbid,
                        name,
                        is_active
                        source {
                          id,
                          dbid,
                          image,
                        }
                      }
                    }
                  }
                }
              }
              assignments(first: 10000) {
                edges {
                  node {
                    name
                    id
                    dbid
                    source {
                      id
                      dbid
                      image
                    }
                  }
                }
              }
              first_response {
                id,
                dbid,
                permissions,
                content,
                attribution(first: 10000) {
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
                annotator {
                  name,
                  profile_image,
                  user {
                    id,
                    dbid,
                    name,
                    is_active
                    source {
                      id,
                      dbid,
                      image,
                    }
                  }
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
              teams(first: 2) {
                edges {
                  node {
                    id,
                    dbid,
                    name,
                    slug
                  }
                }
              }
              projects(first: 2) {
                edges {
                  node {
                    id,
                    dbid,
                    title
                    team {
                      slug
                    }
                  }
                }
              }
              user {
                id,
                dbid,
                name,
                is_active,
                source {
                  id,
                  dbid,
                  image,
                }
              }
              task {
                id,
                dbid,
                label,
                type
              }
              tag {
                id
                dbid
                tag
                tag_text
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
                      last_status_obj {
                        id
                        dbid
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
                      field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                      log_count,
                      permissions,
                      verification_statuses,
                      translation_statuses,
                      domain,
                      team {
                        slug,
                        get_embed_whitelist
                      }
                      media {
                        embed
                        embed_path,
                        thumbnail_path,
                        url,
                        quote
                      }
                      user {
                        dbid
                        name
                        is_active
                        source {
                          dbid
                          image
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
          get_suggested_tags
          get_embed_whitelist
          get_status_target_turnaround
          private
          slug
          search_id
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
      }
`,
  },
});

class ProjectMedia extends Component {
  componentWillMount() {
    this.context.router.setRouteLeaveHook(
      this.props.route,
      () => {
        const assigned = document.getElementsByClassName('task__required task__assigned-to-current-user').length;
        const answered = document.getElementsByClassName('task__answered-by-current-user task__required task__assigned-to-current-user').length;
        if (answered < assigned) {
          const count = assigned - answered;
          return this.props.intl.formatMessage(messages.confirmLeave, { count });
        }
        return true;
      },
    );
  }

  render() {
    const { props, context } = this;
    let projectId = props.params.projectId || 0;
    const checkContext = new CheckContext({ props, context });
    checkContext.setContext();
    if (!projectId) {
      const store = checkContext.getContextStore();
      if (store.project) {
        projectId = store.project.dbid;
      }
    }
    const ids = `${props.params.mediaId},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaContainer}
        route={route}
        renderLoading={() => <MediasLoading count={1} />}
      />
    );
  }
}

ProjectMedia.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
};

export default injectIntl(ProjectMedia);
