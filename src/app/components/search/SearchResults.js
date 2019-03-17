import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import sortby from 'lodash.sortby';
import isEqual from 'lodash.isequal';
import styled from 'styled-components';
import { searchQueryFromUrl } from './Search';
import SearchQuery from './SearchQuery';
import Toolbar from './Toolbar';
import BulkActions from '../media/BulkActions';
import MediaDetail from '../media/MediaDetail';
import MediasLoading from '../media/MediasLoading';
import SmallMediaCard from '../media/SmallMediaCard';
import SourceCard from '../source/SourceCard';
import ProjectBlankState from '../project/ProjectBlankState';
import { can } from '../Can';
import { notify, safelyParseJSON } from '../../helpers';
import { black87, units, ContentColumn } from '../../styles/js/shared';
import CheckContext from '../../CheckContext';
import SearchRoute from '../../relay/SearchRoute';
import checkSearchResultFragment from '../../relay/checkSearchResultFragment';
import checkDenseSearchResultFragment from '../../relay/checkDenseSearchResultFragment';
import bridgeSearchResultFragment from '../../relay/bridgeSearchResultFragment';
import bridgeDenseSearchResultFragment from '../../relay/bridgeDenseSearchResultFragment';

// TODO Make this a config
const pageSize = 20;

const messages = defineMessages({
  searchResults: {
    id: 'search.results',
    defaultMessage: '{resultsCount, plural, =0 {No items} one {1 item} other {{loadedCount} of # items}}',
  },
  newTranslationRequestNotification: {
    id: 'search.newTranslationRequestNotification',
    defaultMessage: 'New translation request',
  },
  newTranslationNotification: {
    id: 'search.newTranslationNotification',
    defaultMessage: 'New translation',
  },
  newTranslationNotificationBody: {
    id: 'search.newTranslationNotificationBody',
    defaultMessage: 'An item was just marked as "translated"',
  },
  searchResultsWithSelection: {
    id: 'search.resultsWithSelection',
    defaultMessage: '{resultsCount, plural, =0 {No items} one {1 item} other {{loadedCount} of # items}} {selectedCount, plural, =0 {} one {(1 selected)} other {(# selected)}}',
  },
});

const StyledSearchResultsWrapper = styled.div`
    padding-bottom: 0 0 ${units(2)};

    .results li {
      margin-top: ${units(1)};
      list-style-type: none;
    }

  .search__results-heading {
    color: ${black87};
    font-size: larger;
    font-weight: bolder;
    margin-top: ${units(3)};
    text-align: center;
  }

  .dense {
    display: flex;
    flex-wrap: wrap;
  }

  .medias__item {
    margin: ${units(1)};
  }
`;

class SearchResultsComponent extends React.Component {
  static mergeResults(medias, sources) {
    if (medias.length === 0 && sources.length === 0) {
      return [];
    }
    if (sources.length === 0) {
      return medias;
    }
    if (medias.length === 0) {
      return sources;
    }
    const query = searchQueryFromUrl();
    const comparisonField = query.sort === 'recent_activity'
      ? o => o.node.updated_at
      : o => o.node.published;

    const results = sortby(Array.concat(medias, sources), comparisonField);
    return query.sort_type !== 'ASC' ? results.reverse() : results;
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedMedia: [],
      subscribed: false,
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
           !isEqual(this.props.view, nextProps.view) ||
           !isEqual(this.props.search, nextProps.search);
  }

  componentWillUpdate(nextProps) {
    if (this.props.search.pusher_channel !== nextProps.search.pusher_channel) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.search.pusher_channel !== prevProps.search.pusher_channel) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.state.subscribed) {
      this.unsubscribe();
    }
  }

  onSelect(id) {
    const selectedMedia = this.state.selectedMedia.slice(0);
    const index = selectedMedia.indexOf(id);
    if (index === -1) {
      selectedMedia.push(id);
    } else {
      selectedMedia.splice(index, 1);
    }
    this.setState({ selectedMedia });
  }

  onSelectAll() {
    const { search } = this.props;
    const selectedMedia = search ? search.medias.edges.map(item => item.node.id) : [];
    this.setState({ selectedMedia });
  }

  onUnselectAll() {
    this.setState({ selectedMedia: [] });
  }

  getContext() {
    return new CheckContext(this);
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  subscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel) {
      const { search: { pusher_channel: channel } } = this.props;

      pusher.unsubscribe(channel);

      pusher.subscribe(channel).bind('bulk_update_start', 'Search', () => {
        this.props.relay.forceFetch();
        return true;
      });

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', () => {
        this.props.relay.forceFetch();
        return true;
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data) => {
        const message = safelyParseJSON(data.message, {});
        const { currentUser } = this.currentContext();
        const currentUserId = currentUser ? currentUser.dbid : 0;
        const avatar = config.restBaseUrl.replace(/\/api.*/, '/images/bridge.png');

        // Notify other users that there is a new translation request
        if (
          message.class_name === 'translation_request' &&
          currentUserId !== message.user_id
        ) {
          const url = window.location.pathname.replace(
            /(^\/[^/]+\/project\/[0-9]+).*/,
            `$1/media/${message.id}`,
          );
          notify(
            this.props.intl.formatMessage(messages.newTranslationRequestNotification),
            '',
            url,
            avatar,
            '_self',
          );
        }

        if (this.currentContext().clientSessionId !== data.actor_session_id) {
          this.props.relay.forceFetch();
          return true;
        }
        return false;
      });

      this.setState({ subscribed: true });
    }
  }

  unsubscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel) {
      pusher.unsubscribe(this.props.search.pusher_channel);
      this.setState({ subscribed: false });
    }
  }

  loadMore() {
    const { medias, sources } = this.props.search;

    this.props.relay.setVariables({
      pageSize: (medias ? medias.edges.length : 0) +
      (sources ? sources.edges.length : 0) + pageSize,
    });
  }

  render() {
    const medias = this.props.search.medias ? this.props.search.medias.edges : [];
    const sources = this.props.search.sources ? this.props.search.sources.edges : [];

    const searchResults = SearchResultsComponent.mergeResults(medias, sources);
    const count = this.props.search ? this.props.search.number_of_results : 0;

    const hasMore = (searchResults.length < count);

    const mediasCount =
      this.state.selectedMedia.length ?
        this.props.intl.formatMessage(messages.searchResultsWithSelection, {
          loadedCount: searchResults.length,
          resultsCount: count,
          selectedCount: this.state.selectedMedia.length,
        }) :
        this.props.intl.formatMessage(messages.searchResults, {
          loadedCount: searchResults.length,
          resultsCount: count,
        });

    const team = medias.length > 0 ? medias[0].node.team : this.currentContext().team;

    const isProject = /\/project\//.test(window.location.pathname);

    const searchQueryProps = {
      view: this.props.view,
      project: this.props.project,
      team: this.props.team,
      fields: this.props.fields,
      title: this.props.title,
      addons: this.props.addons,
    };

    let title = null;
    let bulkActionsAllowed = false;
    if (medias.length) {
      bulkActionsAllowed = !medias[0].node.archived && can(medias[0].node.permissions, 'administer Content');
    }
    title = (
      <Toolbar
        filter={
          <SearchQuery
            teamSlug={team.slug}
            project={this.currentContext().project}
            {...searchQueryProps}
          />
        }
        actions={medias.length && bulkActionsAllowed ?
          <BulkActions
            team={team}
            project={this.currentContext().project}
            selectedMedia={this.state.selectedMedia}
            onSelectAll={this.onSelectAll.bind(this)}
            onUnselectAll={this.onUnselectAll.bind(this)}
          /> : null}
        title={<span className="search__results-heading">{mediasCount}</span>}
        project={isProject ? this.currentContext().project : null}
        addons={this.props.toolbarAddons}
      />
    );

    const viewMode = window.location.pathname.match(/dense\/*.*$/) ? 'dense' : 'list';

    const view = {
      dense: item => (
        item.media ?
          <SmallMediaCard
            media={item}
            selected={this.state.selectedMedia.indexOf(item.id) > -1}
            onSelect={this.onSelect.bind(this)}
            style={{ margin: units(3) }}
          /> : null
      ),
      list: item => (
        item.media ?
          <MediaDetail
            media={item}
            condensed
            selected={this.state.selectedMedia.indexOf(item.id) > -1}
            onSelect={this.onSelect.bind(this)}
            parentComponent={this}
          /> : <SourceCard source={item} />
      ),
    };

    let content = null;
    if (isProject && count === 0) {
      content = <ProjectBlankState project={this.currentContext().project} />;
    } else {
      content = (
        <InfiniteScroll hasMore={hasMore} loadMore={this.loadMore.bind(this)} threshold={500}>
          <div className={`search__results-list results medias-list ${viewMode}`}>
            {searchResults.map(item => (
              <li key={item.node.id} className="medias__item">
                { view[viewMode](item.node) }
              </li>))}
          </div>
        </InfiniteScroll>
      );
    }

    return (
      <ContentColumn wide={(viewMode === 'dense')}>
        <StyledSearchResultsWrapper className="search__results results">
          <div style={{ margin: `${units(2)} 0` }}>{title}</div>
          {content}
        </StyledSearchResultsWrapper>
      </ContentColumn>
    );
  }
}

SearchResultsComponent.contextTypes = {
  store: PropTypes.object,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

// eslint-disable-next-line react/no-multi-comp
class SearchResults extends React.PureComponent {
  render() {
    const SearchResultsContainer = Relay.createContainer(injectIntl(SearchResultsComponent), {
      initialVariables: {
        pageSize,
      },
      fragments: {
        search: () => {
          if (this.props.view === 'dense') {
            return config.appName === 'bridge' ? bridgeDenseSearchResultFragment : checkDenseSearchResultFragment;
          }
          return config.appName === 'bridge' ? bridgeSearchResultFragment : checkSearchResultFragment;
        },
      },
    });

    const resultsRoute = new SearchRoute({ query: JSON.stringify(this.props.query) });

    return (
      <Relay.RootContainer
        Component={SearchResultsContainer}
        route={resultsRoute}
        renderFetched={data => <SearchResultsContainer {...this.props} {...data} />}
        renderLoading={() => <MediasLoading />}
      />
    );
  }
}

export default SearchResults;
