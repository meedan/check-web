import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import sortby from 'lodash.sortby';
import styled from 'styled-components';
import BulkActions from '../media/BulkActions';
import SmallMediaCard from '../media/SmallMediaCard';
import MediaDetail from '../media/MediaDetail';
import SourceCard from '../source/SourceCard';
import ProjectBlankState from '../project/ProjectBlankState';
import { notify, safelyParseJSON } from '../../helpers';
import { black87, units, ContentColumn } from '../../styles/js/shared';
import CheckContext from '../../CheckContext';
import { searchQueryFromUrl } from './Search';
import checkSearchResultFragment from '../../relay/checkSearchResultFragment';
import bridgeSearchResultFragment from '../../relay/bridgeSearchResultFragment';

// TODO Make this a config
const pageSize = 20;

const messages = defineMessages({
  searchResults: {
    id: 'search.results',
    defaultMessage: '{resultsCount, plural, =0 {No results} one {1 result} other {# results}}',
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
    defaultMessage: '{resultsCount, plural, =0 {No results} one {1 result} other {# results}} ({selectedCount, plural, =0 {None selected} one {1 selected} other {# selected}})',
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
      pusherSubscribed: false,
      selectedMedia: [],
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
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
    if (pusher && this.props.search.pusher_channel && !this.state.pusherSubscribed) {
      const { search: { pusher_channel: channel } } = this.props;

      pusher.unsubscribe(channel);

      pusher.subscribe(channel).bind('media_updated', (data) => {
        const message = safelyParseJSON(data.message, {});
        const { currentUser } = this.currentContext();
        const currentUserId = currentUser ? currentUser.dbid : 0;
        const avatar = config.restBaseUrl.replace(/\/api.*/, '/images/bridge.png');

        let content = null;
        try {
          content = message.quote || message.url || message.file.url;
        } catch (e) {
          content = null;
        }

        // Notify other users that there is a new translation request
        if (
          content &&
          message.class_name === 'translation_request' &&
          currentUserId !== message.user_id
        ) {
          const url = window.location.pathname.replace(
            /(^\/[^/]+\/project\/[0-9]+).*/,
            `$1/media/${message.id}`,
          );
          notify(
            this.props.intl.formatMessage(messages.newTranslationRequestNotification),
            content,
            url,
            avatar,
            '_self',
          );
        } else if (
          message.annotation_type === 'translation_status' &&
          currentUserId !== message.annotator_id
        ) {
          // Notify other users that there is a new translation
          let translated = false;
          message.data.fields.forEach((field) => {
            if (field.field_name === 'translation_status_status' && field.value === 'translated') {
              translated = true;
            }
          });
          if (translated) {
            const url = window.location.pathname.replace(
              /(^\/[^/]+\/project\/[0-9]+).*/,
              `$1/media/${message.annotated_id}`,
            );
            notify(
              this.props.intl.formatMessage(messages.newTranslationNotification),
              this.props.intl.formatMessage(messages.newTranslationNotificationBody),
              url,
              avatar,
              '_self',
            );
          }
        }

        if (this.currentContext().clientSessionId !== data.actor_session_id) {
          this.props.relay.forceFetch();
        }
      });
      this.setState({ pusherSubscribed: true });
    }
  }

  unsubscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel) {
      pusher.unsubscribe(this.props.search.pusher_channel);
    }
  }

  loadMore() {
    this.props.relay.setVariables({
      pageSize: this.props.search.medias.edges.length +
        this.props.search.sources.edges.length + pageSize,
    });
  }

  render() {
    const medias = this.props.search ? this.props.search.medias.edges : [];
    const sources = this.props.search ? this.props.search.sources.edges : [];

    const searchResults = SearchResultsComponent.mergeResults(medias, sources);
    const count = this.props.search ? this.props.search.number_of_results : 0;

    const hasMore = (searchResults.length < count);

    const mediasCount =
      this.state.selectedMedia.length ?
        this.props.intl.formatMessage(messages.searchResultsWithSelection, {
          resultsCount: count,
          selectedCount: this.state.selectedMedia.length,
        }) :
        this.props.intl.formatMessage(messages.searchResults, {
          resultsCount: count,
        });

    const team = medias.length > 0 ? medias[0].node.team : this.currentContext().team;

    const isProject = /\/project\//.test(window.location.pathname);
    let title = null;
    if (isProject && count === 0) {
      title = (<ProjectBlankState project={this.currentContext().project} />);
    } else {
      title = (
        <h3 className="search__results-heading">
          <span style={{ verticalAlign: 'top', lineHeight: '24px' }}>{mediasCount}</span>
          <BulkActions
            team={team}
            project={this.currentContext().project}
            selectedMedia={this.state.selectedMedia}
            onSelectAll={this.onSelectAll.bind(this)}
            onUnselectAll={this.onUnselectAll.bind(this)}
          />
        </h3>
      );
    }

    const viewMode = window.location.pathname.match(/dense\/*$/) ? 'dense' : 'list';
    const view = {
      dense: item => (
        <SmallMediaCard style={{ margin: units(3) }} media={item} />
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

    return (
      <ContentColumn wide={(viewMode === 'dense')}>
        <StyledSearchResultsWrapper className="search__results results">
          {title}
          <InfiniteScroll hasMore={hasMore} loadMore={this.loadMore.bind(this)} threshold={500}>
            <div className={`search__results-list results medias-list ${viewMode}`}>
              {searchResults.map(item => (
                <li key={item.node.id} className="medias__item">
                  { view[viewMode](item.node) }
                </li>))}
            </div>
          </InfiniteScroll>
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

const SearchResultsContainer = Relay.createContainer(injectIntl(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => config.appName === 'bridge' ? bridgeSearchResultFragment : checkSearchResultFragment,
  },
});

export default SearchResultsContainer;
