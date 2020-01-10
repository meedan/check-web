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
import MediaActionsBar from './MediaActionsBar';
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
  of: {
    id: 'mediaSearch.of',
    defaultMessage: 'of',
  },
});

const StyledPager = styled.div`
  position: absolute;
  top: 0;
  width: 20%;
  left: 30%;
  height: ${units(8)};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
    const pathname = window.location.pathname.match(/^(\/[^/]+\/(project\/[0-9]+\/)?media\/[0-9]+)/)[1];
    this.currentContext().history.push({ pathname, state: { query } });
  }

  updateUrl() {
    if (/^\/[^/]+\/(project\/[0-9]+\/)?media\/([0-9]+)/.test(window.location.pathname)) {
      const currId = parseInt(window.location.pathname.match(/^\/[^/]+\/(project\/[0-9]+\/)?media\/([0-9]+)/)[2], 10);
      const medias = this.props.search.medias.edges;
      const newId = medias.length > 0 ? parseInt(medias[0].node.dbid, 10) : null;
      if (newId && currId !== newId) {
        const query = this.searchQueryFromUrl();
        const teamSlug = window.location.pathname.match(/(^\/[^/]+)\/(project\/[0-9]+\/)?media\/[0-9]+.*/)[1];
        let projectPart = '';
        if (medias[0] && medias[0].node && medias[0].node.project_id) {
          projectPart = `project/${medias[0].node.project_id}/`;
        }
        const pathname = `${teamSlug}/${projectPart}media/${newId}`;
        this.currentContext().history.push({ pathname, state: { query } });
      }
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
    const medias = this.props.search.medias.edges;
    const media = medias.length > 0 ? medias[0].node : null;
    const numberOfResults = this.props.search.number_of_results;

    if (media === null) {
      window.location = `${window.location.href}?reload=true`;
      return null;
    }

    return (
      <div>
        <div style={{ display: 'flex' }}>
          <StyledPager>
            <Tooltip title={this.props.intl.formatMessage(messages.previousItem)}>
              <button onClick={this.previousItem.bind(this)} id="media-search__previous-item">
                <PrevIcon style={{ opacity: offset === 0 ? '0.25' : '1' }} />
              </button>
            </Tooltip>
            <span id="media-search__current-item">{offset + 1} {this.props.intl.formatMessage(messages.of)} {numberOfResults}</span>
            <Tooltip title={this.props.intl.formatMessage(messages.nextItem)}>
              <button onClick={this.nextItem.bind(this)} id="media-search__next-item">
                <NextIcon style={{ opacity: offset + 1 === numberOfResults ? '0.25' : '1' }} />
              </button>
            </Tooltip>
          </StyledPager>
          <MediaActionsBar
            style={{
              width: '50%',
              position: 'absolute',
              height: 64,
              right: 0,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
              padding: '0 16px',
              justifyContent: 'space-between',
            }}
            router={this.props.context.router}
            route={this.props.route}
            params={{
              projectId: media.project_id,
              mediaId: media.dbid,
            }}
          />
        </div>

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
                    project_ids,
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
      <div>
        <div style={{ display: 'flex' }}>
          <MediaActionsBar
            style={{
              width: '50%',
              position: 'absolute',
              height: 64,
              right: 0,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
              padding: '0 16px',
              justifyContent: 'space-between',
            }}
            router={this.context.router}
            route={this.props.route}
            params={this.props.params}
          />
        </div>
        <Media
          router={this.context.router}
          route={this.props.route}
          params={this.props.params}
        />
      </div>
    );
  }
}

MediaSearch.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
};

export default MediaSearch;
