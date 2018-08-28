import React, { Component } from 'react';
import Relay from 'react-relay';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import ChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import TaskRoute from '../../relay/TaskRoute';
import Annotation from '../annotations/Annotation';
import MediasLoading from '../media/MediasLoading';
import AddAnnotation from '../annotations/AddAnnotation';
import { black16, units, opaqueBlack54 } from '../../styles/js/shared';

const StyledAnnotation = styled.div`
  div {
    box-shadow: none !important;
  }
`;

const StyledTaskLog = styled.div`
  .task__log-top {
    display: flex;
    justify-content: space-between;
    padding: ${units(2)};

    & > span {
      display: flex;
    }

    span {
      outline: 0;
      color: ${opaqueBlack54};
      font-size: 12px;

      span {
        padding: 0 ${units(1)};
      }
    }

    button {
      border: 0;
      background: transparent;
      cursor: pointer;
      outline: 0;
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

const TaskLogComponent = (props) => {
  const task = Object.assign(props.cachedTask, props.task);
  const log = task.log.edges;
  return (
    <div>
      <ul>
        {log.map((node) => {
          const item = node.node;
          if (item.event_type !== 'create_comment') {
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
};

const TaskLogContainer = Relay.createContainer(TaskLogComponent, {
  fragments: {
    task: () => Relay.QL`
      fragment on Task {
        id
        dbid
        log_count
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
                source {
                  id,
                  dbid,
                  image,
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
                        assigned_to {
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

class TaskLog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true,
    };
  }

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const id = this.props.task.dbid;
    const route = new TaskRoute({ id });

    return (
      <StyledTaskLog>
        <div className="task__log-top">
          <button onClick={this.toggle.bind(this)}>
            { this.state.collapsed ?
              <FormattedMessage
                id="taskLog.show"
                defaultMessage="{count, plural, =0 {Show notes} one {Show 1 note} other {Show # notes}}"
                values={{ count: this.props.task.log_count }}
              /> :
              <FormattedMessage
                id="taskLog.hide"
                defaultMessage="{count, plural, =0 {Hide notes} one {Hide 1 note} other {Hide # notes}}"
                values={{ count: this.props.task.log_count }}
              /> }
          </button>
          <span>
            <ChatBubble /> <span>{this.props.task.log_count}</span>
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

export default TaskLog;
