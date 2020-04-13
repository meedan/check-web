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
        id
        dbid
        title
        metadata
        permissions
        pusher_channel
        verification_statuses
        project_id
        project_ids
        requests_count
        project {
          id
          dbid
          title
          search_id
          search { id, number_of_results }
          medias_count
        }
        media {
          url
          quote
          embed_path
        }
        team {
          id
          dbid
          slug
          name
          team_bots(first: 10000) {
            edges {
              node {
                login
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

ProjectMedia.propTypes = {
  router: PropTypes.object.isRequired,
};

ProjectMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(ProjectMedia);
