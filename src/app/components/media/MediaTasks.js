import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Task from '../task/Task';
import Tasks from '../task/Tasks';
import { withPusher, pusherShape } from '../../pusher';
import CreateTask from '../task/CreateTask';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import MediaTags from './MediaTags';
import TagMenu from '../tag/TagMenu';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import { getCurrentProjectId } from '../../helpers';
import {
  subheading2,
  body1,
  black87,
  black54,
  black16,
  FlexRow,
  units,
} from '../../styles/js/shared';

const StyledTaskHeaderRow = styled.div`
  padding: ${units(2)} 0;
  margin-left: ${units(6)};
  justify-content: space-between;
  display: flex;
  color: ${black54};
  font: ${body1};

  h2 {
    color: ${black87};
    flex: 1;
    font: ${subheading2};
    margin: 0;
  }

  .create-task {
    align-self: center;
    color: ${black16};
    cursor: pointer;
  }
`;

const StyledMetadataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${units(3)};
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
    const { fieldset, onTimelineCommentOpen } = this.props;
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const currentUserRole = UserUtil.myRole(
      this.getContext().currentUser,
      this.getContext().team.slug,
    );

    const itemTasks = fieldset === 'tasks' ? media.item_tasks : media.item_metadata;
    const isBrowserExtension = (window.parent !== window);

    return (
      <div>
        { fieldset === 'metadata' ?
          <StyledMetadataRow>
            <TagMenu media={media} />
            <MediaTags
              projectMedia={media}
              onTimelineCommentOpen={onTimelineCommentOpen}
            />
          </StyledMetadataRow> : null }
        <StyledTaskHeaderRow style={isBrowserExtension ? { padding: 0 } : {}}>
          { itemTasks.edges.length && fieldset === 'tasks' && !isBrowserExtension ?
            <FlexRow>
              <h2>
                <FormattedMessage
                  id="mediaComponent.verificationTasks"
                  defaultMessage="Item tasks"
                />
              </h2>
                &nbsp;
              {currentUserRole !== 'annotator' ?
                <FlexRow>
                  {itemTasks.edges.filter(t =>
                    t.node.responses.edges.length > 0).length}/{itemTasks.edges.length
                  }
                  &nbsp;
                  <FormattedMessage id="mediaComponent.answered" defaultMessage="completed" />
                </FlexRow> : null
              }
            </FlexRow> : null}
          { !isBrowserExtension && fieldset === 'tasks' ?
            <CreateTask style={{ marginLeft: 'auto' }} media={media} /> : null}
          { isBrowserExtension && itemTasks.edges.length === 0 ?
            <p style={{ textAlign: 'center', width: '100%', marginTop: units(6) }}>
              <FormattedMessage id="mediaComponent.noTasks" defaultMessage="Nothing to show." />
            </p> : null}
        </StyledTaskHeaderRow>
        <Tasks tasks={itemTasks.edges} media={media} fieldset={fieldset} />
      </div>
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
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        pusher_channel
        item_metadata: tasks(fieldset: "metadata", first: 10000) {
          edges {
            node {
              id,
              dbid,
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
      media.project_ids = [parseInt(params.projectId, 10)];
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

  let projectId = null;
  if (media.project_ids && media.project_ids.length > 0) {
    projectId = getCurrentProjectId(media.project_ids);
  }
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
