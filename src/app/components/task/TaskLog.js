import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import ChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import TaskRoute from '../../relay/TaskRoute';
import CheckContext from '../../CheckContext';
import Annotation from '../annotations/Annotation';
import MediasLoading from '../media/MediasLoading';
import AddAnnotation from '../annotations/AddAnnotation';
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

  componentDidUpdate() {
    const container = document.getElementById(`task-log-${this.props.task.dbid}`);
    if (container) {
      container.scrollTop = container.scrollHeight + 600;
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.cachedTask.project_media.pusher_channel).bind('media_updated', (data) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotation_type === 'task' &&
          parseInt(annotation.id, 10) === parseInt(this.props.task.dbid, 10) &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          this.props.relay.forceFetch();
        }
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.cachedTask.project_media.pusher_channel);
    }
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

TaskLogComponent.contextTypes = {
  store: PropTypes.object,
};

const TaskLogContainer = Relay.createContainer(TaskLogComponent, {
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

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
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
          <span
            className="task__log-icon"
            onClick={this.toggle.bind(this)}
            style={
              this.props.task.cannotAct ? {} : { marginLeft: 50, marginRight: 50 }
            }
          >
            <b>{ pendingSuggestionsCount > 0 ? '•' : null }</b> <ChatBubble /> <span>{logCount}</span>
          </span>
        </div>
        { !this.state.collapsed ? <Relay.RootContainer
          Component={TaskLogContainer}
          renderFetched={data => <TaskLogContainer cachedTask={this.props.task} {...data} />}
          route={route}
          renderLoading={() => <MediasLoading count={1} />}
        /> : null }
        { !this.state.collapsed ? <AddAnnotation
          annotated={this.props.task}
          annotatedType="Task"
          types={['comment']}
        /> : null }
      </StyledTaskLog>
    );
  }
}

TaskLog.contextTypes = {
  store: PropTypes.object,
};

export default TaskLog;
