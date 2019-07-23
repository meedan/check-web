import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import NextIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PrevIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import MediasLoading from './MediasLoading';
import Media from './Media';
import SearchRoute from '../../relay/SearchRoute';
import CheckContext from '../../CheckContext';
import { searchQueryFromUrlQuery, urlFromSearchQuery } from '../search/Search';
import { units, black54 } from '../../styles/js/shared';

const StyledPager = styled.div`
  position: absolute;
  top: 0;
  width: 300px;
  left: 50%;
  margin-left: -150px;
  text-align: center;
  height: ${units(8)};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${units(2)};
  color: ${black54};

  @media (max-width: 650px) {
    top: 43px;
  }

  button {
    background: transparent;
    border: 0;
    color: ${black54};
    cursor: pointer;
    outline: 0;
  }
`;

class MediaSearchComponent extends React.Component {
  static searchQueryFromUrl() {
    const queryString = window.location.pathname.match(/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+\/(.*)/)[1];
    return Object.assign({}, searchQueryFromUrlQuery(queryString));
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  getContext() {
    return new CheckContext(this);
  }

  setOffset(offset) {
    const query = MediaSearchComponent.searchQueryFromUrl();
    query.esoffset = offset;
    const path = window.location.pathname.match(/^(\/[^/]+\/project\/[0-9]+\/media\/[0-9]+)/)[1];
    const url = urlFromSearchQuery(query, path);
    this.getContext().getContextStore().history.push(url);
  }

  previousItem() {
    const query = MediaSearchComponent.searchQueryFromUrl();
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset > 0) {
      this.setOffset(offset - 1);
    }
  }

  nextItem() {
    const query = MediaSearchComponent.searchQueryFromUrl();
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset + 1 < count) {
      this.setOffset(offset + 1);
    }
  }

  render() {
    const query = MediaSearchComponent.searchQueryFromUrl();
    const offset = query.esoffset || 0;
    const media = this.props.search.medias.edges[0].node;
    const numberOfResults = this.props.search.number_of_results;

    return (
      <div>
        <StyledPager>
          <button onClick={this.previousItem.bind(this)} id="media-search__previous-item">
            <PrevIcon style={{ opacity: offset === 0 ? '0.25' : '1' }} />
          </button>
          <span id="media-search__current-item">{offset + 1} / {numberOfResults}</span>
          <button onClick={this.nextItem.bind(this)} id="media-search__next-item">
            <NextIcon style={{ opacity: offset + 1 === numberOfResults ? '0.25' : '1' }} />
          </button>
        </StyledPager>

        <Media
          router={this.props.context.router}
          route={this.props.route}
          params={{
            projectId: media.project_id,
            mediaId: media.dbid,
          }}
        />
      </div>
    );
  }
}

MediaSearchComponent.contextTypes = {
  store: PropTypes.object,
};

// eslint-disable-next-line react/no-multi-comp
class MediaSearch extends React.PureComponent {
  render() {
    const MediaSearchContainer = Relay.createContainer(MediaSearchComponent, {
      initialVariables: {
        pageSize: 1,
      },
      fragments: {
        search: () => Relay.QL`
          fragment on CheckSearch {
            number_of_results
            medias(first: $pageSize) {
              edges {
                node {
                  id,
                  dbid,
                  project_id,
                }
              }
            }
          }
        `,
      },
    });

    const query = MediaSearchComponent.searchQueryFromUrl();
    const route = new SearchRoute({ query: JSON.stringify(query) });

    return (
      <Relay.RootContainer
        Component={MediaSearchContainer}
        route={route}
        renderFetched={
          data => <MediaSearchContainer context={this.context} {...this.props} {...data} />
        }
        renderLoading={() => <MediasLoading />}
      />
    );
  }
}

MediaSearch.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
};

export default MediaSearch;
