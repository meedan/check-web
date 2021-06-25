import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import MediaLanguageChip from './MediaLanguageChip';
import MediasLoading from './MediasLoading';
import MediaTags from './MediaTags';
import Task from '../task/Task';
import Tasks from '../task/Tasks';
import CreateTask from '../task/CreateTask';
import UserUtil from '../user/UserUtil';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import CheckContext from '../../CheckContext';
import {
  subheading2,
  body1,
  black87,
  black54,
  FlexRow,
  units,
  brandSecondary,
} from '../../styles/js/shared';

const StyledAnnotationRow = styled.div`
  /* Tasks and metadata tab have shared styles */

  .annotation-header-row {
    padding: ${units(1)} ${units(3)};
    margin: 0;
    border-bottom: 1px solid ${brandSecondary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${black54};
    font: ${body1};
  }

  h2 {
    color: ${black87};
    flex: 1;
    font: ${subheading2};
    margin: 0;
  }
`;

class MediaTasksComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
      selectedTask: null,
    };
  }

  componentDidMount() {
    this.subscribe();

    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window) {
      // Auto-resize the iframe
      const updateHeight = () => {
        const height = document.documentElement.scrollHeight;
        if (height !== this.state.height) {
          window.parent.postMessage(JSON.stringify({ height }), '*');
          this.setState({ height });
        }
        setTimeout(updateHeight, 500);
      };
      setTimeout(updateHeight, 500);

      document.body.addEventListener('click', (e) => {
        const tasks = document.getElementsByClassName('tasks')[0];
        if (tasks && !tasks.contains(e.target)) {
          const id = this.getSelectedTask();
          if (id) {
            window.parent.postMessage(JSON.stringify({ task: 0 }), '*');
            this.setState({ selectedTask: null });
          }
        }
      });

      // Click on a task to highlight it
      const tasks = document.getElementsByClassName('task');
      for (let i = 0; i < tasks.length; i += 1) {
        const div = tasks[i];
        div.addEventListener('click', (e) => {
          const id = this.getSelectedTask();
          if (id !== div.id && e.target.className !== 'task__log-icon') {
            const task = parseInt(div.id.replace(/^task-/, ''), 10);
            window.parent.postMessage(JSON.stringify({ task }), '*');
            this.setState({ selectedTask: div.id });
          }
        });
      }
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getSelectedTask() {
    return this.state.selectedTask;
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaTasks', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-tasks-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  render() {
    const { fieldset, onTimelineCommentOpen, about } = this.props;
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const currentUserRole = UserUtil.myRole(
      this.getContext().currentUser,
      this.getContext().team.slug,
    );

    const itemTasks = fieldset === 'tasks' ? media.item_tasks : media.item_metadata;
    const isBrowserExtension = (window.parent !== window);

    return (
      <StyledAnnotationRow>
        { fieldset === 'metadata' ?
          <div className="annotation-header-row metadata-row">
            <MediaLanguageChip projectMedia={media} />
            <MediaTags
              projectMedia={media}
              onTimelineCommentOpen={onTimelineCommentOpen}
            />
          </div> : null }
        { fieldset === 'tasks' && !isBrowserExtension ?
          <div className="annotation-header-row task-row">
            { itemTasks.edges.length ?
              <FlexRow>
                <h2>
                  <FormattedMessage
                    id="mediaComponent.verificationTasks"
                    defaultMessage="Item tasks"
                  />
                </h2>
                &nbsp;
                { currentUserRole !== 'annotator' ?
                  <FlexRow>
                    {itemTasks.edges.filter(t =>
                      t.node.responses.edges.length > 0).length}/{itemTasks.edges.length
                    }
                    &nbsp;
                    <FormattedMessage id="mediaComponent.answered" defaultMessage="completed" />
                  </FlexRow> : null }
              </FlexRow> : null }
            <CreateTask style={{ marginLeft: 'auto' }} media={media} />
          </div> : null }
        <Tasks tasks={itemTasks.edges} media={media} about={about} fieldset={fieldset} />
      </StyledAnnotationRow>
    );
  }
}

MediaTasksComponent.contextTypes = {
  store: PropTypes.object,
};

MediaTasksComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const MediaTasksContainer = Relay.createContainer(withPusher(MediaTasksComponent), {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        pusher_channel
        item_tasks: tasks(fieldset: "tasks", first: 10000) {
          edges {
            node {
              id
              dbid
              show_in_browser_extension
              responses(first: 10000) {
                edges {
                  node {
                    id,
                    dbid,
                  }
                }
              }
              ${Task.getFragment('task')},
            }
          }
        }
      }
    `,
  },
});

const MediaMetadataContainer = Relay.createContainer(withPusher(MediaTasksComponent), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        upload_max_size
        upload_extensions
        video_max_size
        video_extensions
        audio_max_size
        audio_extensions
        file_max_size
        file_extensions
        upload_max_dimensions
        upload_min_dimensions
      }
    `,
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        pusher_channel
        ${MediaLanguageChip.getFragment('projectMedia')}
        item_metadata: tasks(fieldset: "metadata", first: 10000) {
          edges {
            node {
              id,
              dbid,
              show_in_browser_extension,
              ${Task.getFragment('task')},
            }
          }
        }
        ${MediaTags.getFragment('projectMedia')}
      }
    `,
  },
});

const MediaTasks = (props) => {
  let { media } = props;
  const { params } = props;

  if (!media && params) {
    media = {
      dbid: parseInt(params.mediaId, 10),
    };
    if (params.projectId) {
      media.project_id = parseInt(params.projectId, 10);
    }
  }

  let { fieldset } = props;

  // Accessing through /.../tasks or /.../metadata
  if (props.route && props.route.path) {
    const path = props.route.path.split('/');
    const lastPathPart = path[path.length - 1];
    if (['tasks', 'metadata'].indexOf(lastPathPart) > -1) {
      fieldset = lastPathPart;
    }
  }

  const projectId = media.project_id;
  const ids = `${media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  if (fieldset === 'metadata') {
    return (
      <Relay.RootContainer
        Component={MediaMetadataContainer}
        renderFetched={data => <MediaMetadataContainer cachedMedia={media} {...data} onTimelineCommentOpen={props.onTimelineCommentOpen} fieldset="metadata" />}
        route={route}
        renderLoading={() => <MediasLoading count={1} />}
      />
    );
  }

  return (
    <Relay.RootContainer
      Component={MediaTasksContainer}
      renderFetched={data => <MediaTasksContainer cachedMedia={media} {...data} fieldset="tasks" />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaTasks;
