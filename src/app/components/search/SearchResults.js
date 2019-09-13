import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import sortby from 'lodash.sortby';
import isEqual from 'lodash.isequal';
import styled from 'styled-components';
import NextIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PrevIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import Tooltip from '@material-ui/core/Tooltip';
import { searchQueryFromUrl, urlFromSearchQuery } from './Search';
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
  previousPage: {
    id: 'search.previousPage',
    defaultMessage: 'Previous page',
  },
  nextPage: {
    id: 'search.nextPage',
    defaultMessage: 'Next page',
  },
});

const StyledSearchResultsWrapper = styled.div`
    padding-bottom: 0 0 ${units(2)};

    .results li {
      margin-top: 0;
      list-style-type: none;
    }

  .search__results-heading {
    color: ${black87};
    font-size: larger;
    font-weight: bolder;
    text-align: center;
    display: flex;
    align-items: center;

    .search__nav {
      margin: 0 ${units(1)};
      display: flex;
      cursor: pointer;
      color: ${black87};
    }
  }

  .dense {
    display: flex;
    flex-wrap: wrap;
  }

  .medias__item {
    margin: ${units(1)};
  }
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
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

  setOffset(offset) {
    const team = this.props.search.team || this.currentContext().team;
    const project = this.props.project || this.currentContext().project;
    const viewMode = window.storage.getValue('view-mode');
    const query = Object.assign({}, searchQueryFromUrl());
    query.esoffset = offset;

    const url = urlFromSearchQuery(
      query,
      project
        ? `/${team.slug}/project/${project.dbid}/${viewMode}`
        : `/${team.slug}/search/${viewMode}`,
    );

    this.getContext().getContextStore().history.push(url);
  }

  previousPage() {
    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset > 0) {
      this.setOffset(offset - pageSize);
    }
  }

  nextPage() {
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset + pageSize < count) {
      this.setOffset(offset + pageSize);
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  subscribe() {
    const { pusher } = this.currentContext();
    if (pusher && this.props.search.pusher_channel) {
      const { search: { pusher_channel: channel } } = this.props;

      pusher.unsubscribe(channel);

      pusher.subscribe(channel).bind('bulk_update_start', 'Search', (data, run) => {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: this.props.relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', (data, run) => {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: this.props.relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data, run) => {
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
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `search-${channel}`,
            callback: this.props.relay.forceFetch,
          };
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

  render() {
    const medias = this.props.search.medias ? this.props.search.medias.edges : [];
    const sources = this.props.search.sources ? this.props.search.sources.edges : [];

    const searchResults = SearchResultsComponent.mergeResults(medias, sources);
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const team = this.props.search.team || this.currentContext().team;

    let smoochBotInstalled = false;
    if (team && team.team_bot_installations) {
      team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    let to = searchResults.length;
    if (to < offset + pageSize) {
      to = offset + pageSize;
    }
    if (to > count) {
      to = count;
    }
    const isProject = /\/project\//.test(window.location.pathname);
    const isTrash = /\/trash/.test(window.location.pathname);

    const searchQueryProps = {
      view: this.props.view,
      project: this.props.project,
      team: this.props.team,
      fields: this.props.fields,
      title: this.props.title,
      addons: this.props.addons,
    };

    let bulkActionsAllowed = false;
    if (medias.length) {
      bulkActionsAllowed = !medias[0].node.archived && can(medias[0].node.permissions, 'administer Content');
    }
    const title = (
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
            count={this.props.search ? this.props.search.number_of_results : 0}
            team={team}
            project={this.currentContext().project}
            selectedMedia={this.state.selectedMedia}
            onSelectAll={this.onSelectAll.bind(this)}
            onUnselectAll={this.onUnselectAll.bind(this)}
          /> : null}
        title={
          <span className="search__results-heading">
            <Tooltip title={this.props.intl.formatMessage(messages.previousPage)}>
              <span
                className="search__previous-page search__nav"
                onClick={this.previousPage.bind(this)}
              >
                <PrevIcon style={{ opacity: offset <= 0 ? '0.25' : '1' }} />
              </span>
            </Tooltip>
            <span className="search__count">
              <FormattedMessage
                id="searchResults.itemsCount"
                defaultMessage="{count, plural, =0 {&nbsp;} one {1 / 1} other {{from} - {to} / #}}"
                values={{
                  from: offset + 1,
                  to,
                  count,
                }}
              />
              {this.state.selectedMedia.length ?
                <span>&nbsp;
                  <FormattedMessage
                    id="searchResults.withSelection"
                    defaultMessage="{selectedCount, plural, =0 {} one {(1 selected)} other {(# selected)}}"
                    values={{
                      selectedCount: this.state.selectedMedia.length,
                    }}
                  />
                </span> : null
              }
            </span>
            <Tooltip title={this.props.intl.formatMessage(messages.nextPage)}>
              <span
                className="search__next-page search__nav"
                onClick={this.nextPage.bind(this)}
              >
                <NextIcon style={{ opacity: to >= count ? '0.25' : '1' }} />
              </span>
            </Tooltip>
          </span>
        }
        project={isProject ? this.currentContext().project : null}
        page={this.props.page}
        search={this.props.search}
      />
    );

    const viewMode = window.storage.getValue('view-mode');

    const view = {
      dense: (item, itemQuery) => (
        item.media ?
          <SmallMediaCard
            query={itemQuery}
            media={{ ...item, team }}
            selected={this.state.selectedMedia.indexOf(item.id) > -1}
            onSelect={this.onSelect.bind(this)}
            style={{ margin: units(3) }}
          /> : null
      ),
      list: (item, itemQuery) => (
        item.media ?
          <MediaDetail
            query={itemQuery}
            media={{ ...item, team }}
            condensed
            selected={this.state.selectedMedia.indexOf(item.id) > -1}
            onSelect={this.onSelect.bind(this)}
            parentComponent={this}
            smoochBotInstalled={smoochBotInstalled}
          /> : <SourceCard source={item} />
      ),
    };

    let content = null;
    if (count === 0) {
      if (isProject) {
        content = <ProjectBlankState project={this.currentContext().project} />;
      }
    } else {
      let itemOffset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
      itemOffset -= 1;

      const itemBaseQuery = Object.assign({ original: query }, query);
      if (Array.isArray(itemBaseQuery.show)) {
        itemBaseQuery.show = itemBaseQuery.show.filter(f => f !== 'sources');
      }
      if (isProject) {
        itemBaseQuery.parent = { type: 'project', id: this.currentContext().project.dbid };
        itemBaseQuery.projects = [this.currentContext().project.dbid];
        itemBaseQuery.referer = 'project';
      } else {
        itemBaseQuery.parent = { type: 'team', slug: team.slug };
        itemBaseQuery.referer = 'search';
      }
      if (isTrash) {
        itemBaseQuery.archived = 1;
        itemBaseQuery.referer = 'trash';
      }
      itemBaseQuery.timestamp = new Date().getTime();

      content = (
        <div className={`search__results-list results medias-list ${viewMode}`}>
          {searchResults.map((item) => {
            let itemQuery = {};
            if (item.node.media) {
              itemOffset += 1;
              itemQuery = Object.assign({}, itemBaseQuery);
              itemQuery.esoffset = itemOffset;
            }
            const listItem = (
              <li key={item.node.id} className="medias__item">
                { view[viewMode](item.node, itemQuery) }
              </li>
            );
            return listItem;
          })}
        </div>
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
