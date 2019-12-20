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
        relationships { id, sources_count, targets_count },
        relationship {
          id
          permissions
          source { id, dbid }
          source_id
          target { id, dbid }
          target_id
        }
        targets_by_users(first: 50) {
          edges {
            node {
              id
              dbid
              last_status
            }
          }
        },
        url,
        metadata,
        last_status,
        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
        log_count,
        domain,
        permissions,
        project {
          id,
          dbid,
          title,
          search_id,
          search { id, number_of_results },
          get_languages,
          medias_count,
          team { id, medias_count },
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
          type,
          url,
          quote,
          metadata,
          embed_path,
          thumbnail_path,
          file_path,
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
        team {
          get_suggested_tags
          get_embed_whitelist
          get_status_target_turnaround
          private
          slug
          search_id
          search { id, number_of_results }
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
      }
`,
  },
});

class ProjectMedia extends Component {
  componentWillMount() {
    const router = this.context.router || this.props.router;
    router.setRouteLeaveHook(
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
