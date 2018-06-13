import React, { Component } from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import CreateRelatedMedia from './CreateRelatedMedia';
import MediaRoute from '../../relay/MediaRoute';
import mediaFragment from '../../relay/mediaFragment';
import MediaDetail from './MediaDetail';
import MediasLoading from './MediasLoading';
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

const getFilters = () => {
  let filters = '{}';
  const urlParts = document.location.pathname.split('/');
  try {
    filters = JSON.parse(decodeURIComponent(urlParts[urlParts.length - 1]));
  } catch (e) {
    filters = '{}';
  }
  if (typeof filters === 'object') {
    filters = JSON.stringify(filters);
  } else {
    filters = '{}';
  }
  return filters;
};

const previousFilters = {};

class MediaRelatedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const filters = getFilters();
    const { dbid } = this.props.media;

    if (!previousFilters[dbid]) {
      previousFilters[dbid] = filters;
    }

    if (filters !== previousFilters[dbid]) {
      previousFilters[dbid] = filters;
      this.props.relay.setVariables({ filters });
      this.props.relay.forceFetch();
      return null;
    }

    let medias = [];
    const { relationships } = this.props.media;
    const { targets_count } = relationships;
    const targets = relationships.targets.edges;
    const sources = relationships.sources.edges;
    let filtered_count = 0;
    if (targets.length > 0) {
      medias = targets[0].node.targets.edges;
      filtered_count = targets_count - medias.length;
    } else if (sources.length > 0) {
      medias.push({ node: sources[0].node.source });
      sources[0].node.siblings.edges.forEach((sibling) => {
        if (sibling.node.dbid !== this.props.media.dbid) {
          medias.push(sibling);
        }
      });
    }

    return (
      <div style={{ display: this.state.loading ? 'none' : 'block' }}>
        { this.props.showHeader ?
          <StyledHeaderRow>
            <FlexRow>
              <h2>
                <FormattedMessage
                  id="mediaRelated.relatedClaims"
                  defaultMessage="Related claims"
                />
              </h2>
            </FlexRow>
            <CreateRelatedMedia style={{ marginLeft: 'auto' }} media={this.props.media} />
          </StyledHeaderRow> : null }

        { this.props.showNumbers ?
          <StyledHeaderRow>
            <FlexRow>
              <FormattedMessage
                id="mediaRelated.counter"
                defaultMessage="{total} related claims ({hidden} hidden by filters)"
                values={{ total: targets_count, hidden: filtered_count }}
              />
            </FlexRow>
          </StyledHeaderRow> : null }

        <FlexRow>
          <ul style={{ width: '100%' }}>
            {medias.map((item) => {
              if (item.node.archived) {
                return null;
              }
              return (
                <li key={item.node.dbid} className="medias__item" style={{ paddingBottom: units(1) }}>
                  {<MediaDetail media={item.node} condensed parentComponent={this} hideRelated />}
                  {<ul />}
                </li>
              );
            })}
          </ul>
        </FlexRow>
      </div>
    );
  }
}

const MediaRelatedContainer = Relay.createContainer(MediaRelatedComponent, {
  initialVariables: {
    contextId: null,
    filters: getFilters(),
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        media {
          quote
        }
        project {
          dbid
          search_id
          permissions
          team {
            search_id
          }
        }
        relationships {
          target_id
          source_id
          targets_count
          sources_count
          targets(first: 10000, filters: $filters) {
            edges {
              node {
                id
                type
                targets(first: 10000) {
                  edges {
                    node {
                      ${mediaFragment}
                    }
                  }
                }
              }
            }
          }
          sources(first: 10000) {
            edges {
              node {
                id
                type
                siblings(first: 10000) {
                  edges {
                    node {
                      ${mediaFragment}
                    }
                  }
                }
                source {
                  ${mediaFragment}
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
  const ids = `${props.media.dbid},${props.media.project_id}`;
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
