import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import NextIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PrevIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import Tooltip from '@material-ui/core/Tooltip';
import MediasLoading from './MediasLoading';
import Media from './Media';
import SearchRoute from '../../relay/SearchRoute';
import CheckContext from '../../CheckContext';
import { units, black54 } from '../../styles/js/shared';

const messages = defineMessages({
  previousItem: {
    id: 'mediaSearch.previousItem',
    defaultMessage: 'Previous item',
  },
  nextItem: {
    id: 'mediaSearch.nextItem',
    defaultMessage: 'Next item',
  },
});

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
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.updateUrl();
  }

  componentWillUpdate() {
    this.updateUrl();
  }

  getContext() {
    return new CheckContext(this);
  }

  setOffset(offset) {
    const query = this.searchQueryFromUrl();
    query.esoffset = offset;
    const pathname = window.location.pathname.match(/^(\/[^/]+\/project\/[0-9]+\/media\/[0-9]+)/)[1];
    this.currentContext().history.push({ pathname, state: { query } });
  }

  updateUrl() {
    const currId = parseInt(window.location.pathname.match(/^\/[^/]+\/project\/[0-9]+\/media\/([0-9]+)/)[1], 10);
    const newId = parseInt(this.props.search.medias.edges[0].node.dbid, 10);
    if (currId !== newId) {
      const query = this.searchQueryFromUrl();
      const pathBase = window.location.pathname.match(/(^\/[^/]+\/project\/[0-9]+\/media\/)[0-9]+.*/)[1];
      const pathname = `${pathBase}${newId}`;
      this.currentContext().history.push({ pathname, state: { query } });
    }
  }

  searchQueryFromUrl() {
    const { state } = this.context.router.location;
    let searchQuery = {};
    if (state && state.query) {
      searchQuery = state.query;
    }
    return Object.assign({}, searchQuery);
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  previousItem() {
    const query = this.searchQueryFromUrl();
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset > 0) {
      this.setOffset(offset - 1);
    }
  }

  nextItem() {
    const query = this.searchQueryFromUrl();
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset + 1 < count) {
      this.setOffset(offset + 1);
    }
  }

  render() {
    const query = this.searchQueryFromUrl();
    const offset = query.esoffset || 0;
    const media = this.props.search.medias.edges[0].node;
    const numberOfResults = this.props.search.number_of_results;

    return (
      <div>
        <StyledPager>
          <Tooltip title={this.props.intl.formatMessage(messages.previousItem)}>
            <button onClick={this.previousItem.bind(this)} id="media-search__previous-item">
              <PrevIcon style={{ opacity: offset === 0 ? '0.25' : '1' }} />
            </button>
          </Tooltip>
          <span id="media-search__current-item">{offset + 1} / {numberOfResults}</span>
          <Tooltip title={this.props.intl.formatMessage(messages.nextItem)}>
            <button onClick={this.nextItem.bind(this)} id="media-search__next-item">
              <NextIcon style={{ opacity: offset + 1 === numberOfResults ? '0.25' : '1' }} />
            </button>
          </Tooltip>
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
  router: PropTypes.object,
};

// eslint-disable-next-line react/no-multi-comp
class MediaSearch extends React.PureComponent {
  render() {
    const { state } = this.context.router.location;
    let mediaQuery = null;
    if (state && state.query) {
      mediaQuery = state.query;
    }

    if (mediaQuery) {
      const MediaSearchContainer = Relay.createContainer(injectIntl(MediaSearchComponent), {
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

      const route = new SearchRoute({ query: JSON.stringify(mediaQuery) });

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

    return (
      <Media
        router={this.context.router}
        route={this.props.route}
        params={this.props.params}
      />
    );
  }
}

MediaSearch.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
};

export default MediaSearch;
