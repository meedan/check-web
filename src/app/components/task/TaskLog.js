import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import ChatBubble from '@material-ui/icons/ChatBubble';
import Tooltip from '@material-ui/core/Tooltip';
import { withPusher, pusherShape } from '../../pusher';
import TaskRoute from '../../relay/TaskRoute';
import CheckContext from '../../CheckContext';
import AddAnnotation from '../annotations/AddAnnotation';
import Annotation from '../annotations/Annotation';
import ProfileLink from '../layout/ProfileLink';
import MediasLoading from '../media/MediasLoading';
import UserTooltip from '../user/UserTooltip';
import UserUtil from '../user/UserUtil';
import { black16, units, opaqueBlack54, checkBlue } from '../../styles/js/shared';

const StyledAnnotation = styled.div`
  div {
    box-shadow: none !important;
  }

  .annotation__card-content {
    display: block;
  }

  .annotation__avatar-col {
    display: flex;
  }

  .avatar {
    align-self: flex-end;
  }

  .annotation__card-footer {
    align-self: flex-end;
    line-height: 32px;
  }
`;

const StyledTaskLog = styled.div`
  .task__log-top {
    display: flex;
    justify-content: flex-end;

    b {
      color: ${checkBlue};
      font-size: 36px;
    }

    & > span {
      display: flex;
      cursor: pointer;
    }

    span {
      outline: 0;
      color: ${opaqueBlack54};
      font-size: 12px;

      span {
        padding: 0 ${units(1)};
      }
    }

    .task__log-icon {
      margin-top: -35px;
      position: relative;
      z-index: 2;
    }
  }

  ul {
    max-height: 600px;
    overflow: auto;
    border-top: 1px solid ${black16};
    border-bottom: 1px solid ${black16};

    li {
      border-bottom: 1px solid ${black16};

      &:last-child {
        border-bottom: 0;
      }
    }
  }
`;

/* eslint react/no-multi-comp: 0 */

const messages = defineMessages({
  bubbleTooltip: {
    id: 'taskLog.bubbleTooltip',
    defaultMessage: 'Toggle log',
  },
});

class TaskLogComponent extends Component {
  static scrollToAnnotation() {
    if (window.location.hash !== '') {
      const id = window.location.hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element && element.scrollIntoView !== undefined) {
        element.scrollIntoView();
      }
    }
  }

  componentDidMount() {
    TaskLogComponent.scrollToAnnotation();
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.task.dbid !== nextProps.task.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    const container = document.getElementById(`task-log-${this.props.task.dbid}`);
    if (container) {
      container.scrollTop = container.scrollHeight + 600;
    }
    if (this.props.task.dbid !== prevProps.task.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const {
      pusher,
      clientSessionId,
      cachedTask,
      task,
    } = this.props;
    pusher.subscribe(cachedTask.project_media.pusher_channel).bind('media_updated', 'TaskLog', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotation_type === 'task' &&
        parseInt(annotation.id, 10) === parseInt(this.props.task.dbid, 10) &&
        clientSessionId !== data.actor_session_id
      ) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `task-log-${task.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, cachedTask } = this.props;
    pusher.unsubscribe(cachedTask.project_media.pusher_channel);
  }

  render() {
    const { props } = this;
    const task = Object.assign(props.cachedTask, props.task);
    const log = task.log.edges;
    return (
      <div>
        <ul id={`task-log-${task.dbid}`}>
          {log.map((node) => {
            const item = node.node;
            if (item.event_type !== 'create_comment' &&
              item.event_type !== 'create_dynamicannotationfield' &&
              item.event_type !== 'update_dynamicannotationfield') {
              return null;
            }
            return (
              <li key={item.id}>
                <StyledAnnotation>
                  <Annotation
                    annotation={item}
                    annotated={task}
                    annotatedType="Task"
                  />
                </StyledAnnotation>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

TaskLogComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const TaskLogContainer = Relay.createContainer(withPusher(TaskLogComponent), {
  initialVariables: {
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  },
  fragments: {
    task: () => Relay.QL`
      fragment on Task {
        id
        dbid
        log_count
        suggestions_count
        pending_suggestions_count
        project_media {
          id
          dbid
          archived
          pusher_channel
          team {
            id
            dbid
            slug
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
              user {
                id,
                dbid,
                name,
                is_active,
                team_user(team_slug: $teamSlug) {
                  ${ProfileLink.getFragment('teamUser')},
                  ${UserTooltip.getFragment('teamUser')},
                },
                source {
                  id,
                  dbid,
                  image,
                },
                bot {
                  dbid
                }
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
                      last_status,
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
                      log_count,
                      permissions,
                      domain,
                      team {
                        slug,
                        get_embed_whitelist
                      }
                      media {
                        type,
                        metadata,
                        embed_path,
                        thumbnail_path,
                        file_path,
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
      }
    `,
  },
});

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class TaskLog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: (window.location.hash === ''),
    };
  }

  toggle(e) {
    this.setState({ collapsed: !this.state.collapsed });
    e.stopPropagation();
  }

  currentContext() {
    return new CheckContext(this).getContextStore();
  }

  render() {
    const id = this.props.task.dbid;
    const route = new TaskRoute({ id });
    const suggestionsCount = this.props.task.suggestions_count || 0;
    const pendingSuggestionsCount = this.props.task.pending_suggestions_count || 0;
    const { currentUser, team } = this.currentContext();
    const logCount = UserUtil.myRole(currentUser, team.slug) === 'annotator' ?
      null : (this.props.task.log_count + suggestionsCount);

    return (
      <StyledTaskLog>
        <div className="task__log-top">
          <Tooltip title={this.props.intl.formatMessage(messages.bubbleTooltip)}>
            <span
              className="task__log-icon"
              onClick={this.toggle.bind(this)}
              style={
                this.props.task.cannotAct ? {} : { marginLeft: 50, marginRight: 50 }
              }
            >
              <b>{ pendingSuggestionsCount > 0 ? '•' : null }</b> <ChatBubble /> <span>{logCount}</span>
            </span>
          </Tooltip>
        </div>
        { !this.state.collapsed ? <Relay.RootContainer
          Component={TaskLogContainer}
          renderFetched={data => <TaskLogContainer cachedTask={this.props.task} {...data} />}
          route={route}
          renderLoading={() => <MediasLoading count={1} />}
        /> : null }
        { !this.state.collapsed && !this.props.task.project_media.archived ?
          <div id={`task-${this.props.task.dbid}-log`}>
            <AddAnnotation
              annotated={this.props.task}
              annotatedType="Task"
              taskResponse={this.props.response}
              types={['comment']}
            />
          </div> : null }
      </StyledTaskLog>
    );
  }
}

TaskLog.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TaskLog);
