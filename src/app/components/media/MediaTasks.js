import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Tasks from '../task/Tasks';
import { withPusher, pusherShape } from '../../pusher';
import CreateTask from '../task/CreateTask';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import ProfileLink from '../layout/ProfileLink';
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
} from '../../styles/js/shared';

const StyledTaskHeaderRow = styled.div`
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
        setTimeout(updateHeight, 1000);
      };
      setTimeout(updateHeight, 1000);

      document.body.addEventListener('click', (e) => {
        const tasks = document.getElementsByClassName('tasks')[0];
        if (tasks && !tasks.contains(e.target)) {
          const id = this.getSelectedTask();
          if (id) {
            const task = document.getElementById(id);
            task.style.border = 0;
            if (document.getElementById(`${id}-log`)) {
              task.getElementsByClassName('task__log-icon')[0].click();
            }
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
            if (id) {
              const prevDiv = document.getElementById(id);
              prevDiv.style.border = 0;
              if (document.getElementById(`${id}-log`)) {
                prevDiv.getElementsByClassName('task__log-icon')[0].click();
              }
            }
            div.style.border = '1px solid #000';
            if (!document.getElementById(`${div.id}-log`)) {
              div.getElementsByClassName('task__log-icon')[0].click();
            }
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
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const currentUserRole = UserUtil.myRole(
      this.getContext().currentUser,
      this.getContext().team.slug,
    );

    return (
      <div>
        <StyledTaskHeaderRow>
          {media.tasks.edges.length ?
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
                  {media.tasks.edges.filter(t =>
                    t.node.responses.edges.length > 0).length}/{media.tasks.edges.length
                  }
                  &nbsp;
                  <FormattedMessage id="mediaComponent.answered" defaultMessage="completed" />
                </FlexRow> : null
              }
            </FlexRow> : null}
          {window.parent === window ?
            <CreateTask style={{ marginLeft: 'auto' }} media={media} /> : null}
          {window.parent !== window && media.tasks.edges.length === 0 ?
            <p style={{ textAlign: 'center', width: '100%' }}>
              <FormattedMessage id="mediaComponent.noTasks" defaultMessage="No tasks to show." />
            </p> : null}
        </StyledTaskHeaderRow>
        <Tasks tasks={media.tasks.edges} media={media} />
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
  initialVariables: {
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        pusher_channel
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
              json_schema,
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
                    image_data,
                    attribution(first: 10000) {
                      edges {
                        node {
                          id
                          dbid
                          name
                          team_user(team_slug: $teamSlug) {
                            ${ProfileLink.getFragment('teamUser')},
                          },
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
                        team_user(team_slug: $teamSlug) {
                          ${ProfileLink.getFragment('teamUser')},
                        },
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
                    team_user(team_slug: $teamSlug) {
                      ${ProfileLink.getFragment('teamUser')},
                    },
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
                image_data,
                attribution(first: 10000) {
                  edges {
                    node {
                      id
                      dbid
                      name
                      team_user(team_slug: $teamSlug) {
                        ${ProfileLink.getFragment('teamUser')},
                      },
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
                    team_user(team_slug: $teamSlug) {
                      ${ProfileLink.getFragment('teamUser')},
                    },
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
      project_ids: [parseInt(params.projectId, 10)],
    };
  }

  const projectId = getCurrentProjectId(media.project_ids);
  const ids = `${media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaTasksContainer}
      renderFetched={data => <MediaTasksContainer cachedMedia={media} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaTasks;
