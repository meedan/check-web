import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Tasks from '../task/Tasks';
import CreateTask from '../task/CreateTask';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import {
  subheading2,
  body1,
  units,
  black87,
  black54,
  black16,
  FlexRow,
} from '../../styles/js/shared';

const StyledTaskHeaderRow = styled.div`
  justify-content: space-between;
  padding-top: ${units(5)};
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

    this.state = {};
  }

  componentDidMount() {
    this.subscribe();
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

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaTasks', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === this.props.media.dbid &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-tasks-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
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
                    t.node.status === 'resolved').length}/{media.tasks.edges.length
                  }
                  &nbsp;
                  <FormattedMessage id="mediaComponent.resolved" defaultMessage="resolved" />
                </FlexRow> : null
              }
            </FlexRow> : null}
          <CreateTask style={{ marginLeft: 'auto' }} media={media} />
        </StyledTaskHeaderRow>
        <Tasks tasks={media.tasks.edges} media={media} />
      </div>
    );
  }
}

MediaTasksComponent.contextTypes = {
  store: PropTypes.object,
};

const MediaTasksContainer = Relay.createContainer(MediaTasksComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        pusher_channel
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
      }
    `,
  },
});

const MediaTasks = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaTasksContainer}
      renderFetched={data => <MediaTasksContainer cachedMedia={props.media} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaTasks;
