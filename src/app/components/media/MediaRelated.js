import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withPusher, pusherShape } from '../../pusher';
import CreateRelatedMedia from './CreateRelatedMedia';
import MediaRoute from '../../relay/MediaRoute';
import MediaDetail from './MediaDetail';
import MediasLoading from './MediasLoading';
import { getCurrentProjectId } from '../../helpers';
import {
  FlexRow,
  black54,
  black87,
  body1,
  subheading2,
  units,
} from '../../styles/js/shared';

const StyledHeaderRow = styled.div`
  justify-content: space-between;
  display: flex;
  color: ${black54};
  font: ${body1};
  height: ${units(6)};

  h2 {
    color: ${black87};
    flex: 1;
    font: ${subheading2};
    margin: 0;
  }
`;

const pageSize = 10;

class MediaRelatedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingMore: false,
    };
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

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('relationship_change', 'MediaRelated', (data, run) => {
      const relationship = JSON.parse(data.message);
      if (clientSessionId !== data.actor_session_id && relationship.source_id === media.dbid) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-relationships-${media.dbid}`,
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

  loadMore() {
    if (!this.state.loadingMore) {
      this.setState({ loadingMore: true }, () => {
        const newSize = this.props.media.secondary_relationships.edges.length + pageSize;
        this.props.relay.setVariables(
          { pageSize: newSize },
          (state) => {
            if (state.done || state.aborted) {
              this.setState({ loadingMore: false });
            }
          },
        );
      });
    }
  }

  render() {
    const medias = [];
    const {
      primary_relationship,
      secondary_relationships_count,
      secondary_relationships,
    } = this.props.media;
    let primaryItem = null;
    let secondaryItemsCount = secondary_relationships_count;
    const hasMore = (secondaryItemsCount > this.props.media.secondary_relationships.edges.length);

    if (primary_relationship && primary_relationship.source) {
      primaryItem = primary_relationship.source;
      secondaryItemsCount -= 1;
    }

    secondary_relationships.edges.forEach((secondary) => {
      const relationship = secondary.node;
      if (relationship.target.dbid !== this.props.media.dbid) {
        const { source_id, target_id } = relationship;
        medias.push({ node: Object.assign(relationship.target, { target_id, source_id }) });
      }
    });

    return (
      <div style={{ marginTop: units(5) }}>
        { primaryItem ?
          <div style={{ marginBottom: units(4) }} id="media-related__primary-item">
            <StyledHeaderRow>
              <FlexRow style={{ marginBottom: units(2) }}>
                <h2>
                  <FormattedMessage
                    id="mediaRelated.primaryItem"
                    defaultMessage="Primary item"
                  />
                </h2>
              </FlexRow>
            </StyledHeaderRow>
            <MediaDetail
              media={primaryItem}
              currentRelatedMedia={this.props.media}
              parentComponent={this}
              parentComponentName="MediaRelated"
              condensed
              hideRelated
              noQuery
            />
          </div> : null }

        <StyledHeaderRow>
          <FlexRow style={{ marginBottom: units(2) }}>
            <h2>
              <FormattedMessage
                id="mediaRelated.secondaryItems"
                defaultMessage="Secondary items"
              />
            </h2>
          </FlexRow>
          <CreateRelatedMedia style={{ marginLeft: 'auto' }} media={this.props.media} />
        </StyledHeaderRow>

        <div>
          { secondaryItemsCount === 0 ?
            null :
            <React.Fragment>
              <ul style={{ width: '100%' }}>
                {medias.map((item) => {
                  if (item.node.archived) {
                    return null;
                  }
                  return (
                    <li key={item.node.id} className="medias__item media-related__secondary-item" style={{ paddingBottom: units(1) }}>
                      {<MediaDetail
                        media={item.node}
                        currentRelatedMedia={this.props.media}
                        parentComponent={this}
                        parentComponentName="MediaRelated"
                        hideRelated
                        condensed
                        noQuery
                      />}
                      {<ul className="empty" />}
                    </li>
                  );
                })}
              </ul>
              { hasMore ?
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button
                    onClick={this.loadMore.bind(this)}
                    disabled={this.state.loadingMore}
                    endIcon={
                      this.state.loadingMore ?
                        <CircularProgress color="inherit" size="1em" /> :
                        null
                    }
                    style={{
                      margin: 'auto',
                    }}
                  >
                    <FormattedMessage
                      id="mediaRelated.loadMore"
                      defaultMessage="Load more"
                    />
                  </Button>
                </div> : null }
            </React.Fragment>
          }
        </div>
      </div>
    );
  }
}

MediaRelatedComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const MediaRelatedContainer = Relay.createContainer(withPusher(MediaRelatedComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        title
        archived
        permissions
        pusher_channel
        team {  # TODO pass as separate prop
          id
          slug
          permissions
          search_id
          projects(first: 10000) {  # for CreateRelatedMedia's CreateProjectMediaMutation
            # TODO pass as separate prop
            edges {
              node {
                id
                dbid
                title
                search_id
                search { id, number_of_results }
                medias_count
              }
            }
          }
        }
        relationships {
          id
          target_id
          source_id
          targets_count
          sources_count
        }
        primary_relationship {
          id
          dbid
          source {
            id
            dbid
            type
            title
            description
            picture
            archived
            created_at
            updated_at
            last_seen
            requests_count
            relationships { sources_count, targets_count },
            relationship {
              id
              permissions
              source { id, dbid }
              source_id
              target { id, dbid }
              target_id
            }
            team {
              slug
            }
          }
        }
        secondary_relationships_count
        secondary_relationships(first: $pageSize) {
          edges {
            node {
              id
              dbid
              target_id
              source_id
              target {
                id
                dbid
                type
                title
                description
                picture
                archived
                created_at
                updated_at
                last_seen
                requests_count
                relationships { sources_count, targets_count },
                relationship {
                  id
                  permissions
                  source { id, dbid }
                  source_id
                  target { id, dbid }
                  target_id
                }
                team {
                  slug
                }
              }
            }
          }
        }
      }
    `,
  },
});

const MediaRelated = (props) => {
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaRelatedContainer}
      renderFetched={data => <MediaRelatedContainer {...props} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaRelated;
