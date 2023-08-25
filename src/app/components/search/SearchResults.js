import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import cx from 'classnames/bind';
import { withPusher, pusherShape } from '../../pusher';
import SearchKeyword from './SearchKeyword';
import SearchFields from './SearchFields';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import FeedIcon from '../../icons/dynamic_feed.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import styles from './SearchResults.module.css';
import Toolbar from './Toolbar';
import BulkActions from '../media/BulkActions';
import MediasLoading from '../media/MediasLoading';
import BlankState from '../layout/BlankState';
import FeedBlankState from '../feed/FeedBlankState';
import ListSort from '../cds/inputs/ListSort';
import SearchResultsTable from './SearchResultsTable';
import SearchResultsCards from './SearchResultsCards';
import SearchRoute from '../../relay/SearchRoute';
import { pageSize } from '../../urlHelpers';

/**
 * Delete `esoffset`, `timestamp` and `channels` -- whenever
 * they can be inferred from the URL or defaults.
 *
 * This is useful for building simple-as-possible URLs.
 */
function simplifyQuery(query) {
  const ret = { ...query };
  delete ret.esoffset;
  delete ret.timestamp;
  if (ret.keyword && !ret.keyword.trim()) {
    delete ret.keyword;
  }
  // if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) {
  //   delete ret.channels;
  // }
  if (/\/(unmatched-media)+/.test(window.location.pathname)) {
    delete ret.unmatched;
  }
  return ret;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
function SearchResultsComponent({
  pusher,
  clientSessionId,
  query: currentQuery,
  defaultQuery,
  search,
  feedTeam,
  feed,
  searchUrlPrefix,
  mediaUrlPrefix,
  showExpand,
  relay,
  title,
  icon,
  listSubtitle,
  listActions,
  page,
  resultType,
  hideFields,
  readOnlyFields,
  savedSearch,
  extra,
}) {
  let pusherChannel = null;
  const [selectedProjectMediaIds, setSelectedProjectMediaIds] = React.useState([]);
  const [query, setQuery] = React.useState(currentQuery);

  console.log('defaultQuery', defaultQuery); // eslint-disable-line
  console.log('currentQuery', currentQuery); // eslint-disable-line
  console.log('query', query); // eslint-disable-line

  const onUnselectAll = () => {
    setSelectedProjectMediaIds([]);
  };

  const getBeginIndex = () => parseInt(query.esoffset /* may be invalid */, 10) || 0;

  const getEndIndex = () => getBeginIndex() + search.medias.edges.length;

  const unsubscribe = () => {
    if (pusherChannel) {
      pusher.unsubscribe(pusherChannel);
      pusherChannel = null;
    }
  };

  const resubscribe = () => {
    if (pusherChannel !== search.pusher_channel) {
      unsubscribe();
    }

    if (search.pusher_channel) {
      const channel = search.pusher_channel;
      pusherChannel = channel;

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', (data, run) => {
        if (run) {
          relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            relay.forceFetch();
            return true;
          }
          return {
            id: `search-${channel}`,
            callback: relay.forceFetch,
          };
        }
        return false;
      });
    }
  };

  const handleChangeSelectedIds = (newSelectedProjectMediaIds) => {
    setSelectedProjectMediaIds(newSelectedProjectMediaIds);
  };

  const navigateToQuery = (newQuery) => {
    const path = Object.keys(newQuery).length > 0
      ? `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(newQuery))}`
      : searchUrlPrefix;
    browserHistory.push(path);
  };

  const handleChangeSortParams = (sortParams) => {
    const newQuery = { ...query };
    if (sortParams === null) {
      delete newQuery.sort;
      delete newQuery.sort_type;
    } else {
      newQuery.sort = sortParams.key;
      newQuery.sort_type = sortParams.ascending ? 'ASC' : 'DESC';
    }
    const cleanQuery = simplifyQuery(newQuery);
    navigateToQuery(cleanQuery);
  };

  /*
  clear means that the user cleared the search after searching by keywords
  and no other sort filter is applied
  if other filter is applied, the new query should keep the previous sort parameter
  */
  const handleChangeQuery = (newQuery) => {
    const cleanQuery = simplifyQuery(newQuery);
    if (query.sort) {
      cleanQuery.sort = query.sort;
    }
    if (query.sort_type) {
      cleanQuery.sort_type = query.sort_type;
    }
    if (newQuery.sort === 'clear') {
      delete cleanQuery.sort;
      delete cleanQuery.sort_type;
    }
    navigateToQuery(cleanQuery);
  };

  const buildSearchUrlAtOffset = (offset) => {
    const cleanQuery = simplifyQuery(query);
    if (offset > 0) {
      cleanQuery.esoffset = offset;
    }

    if (Object.keys(cleanQuery).length > 0) {
      return `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(cleanQuery))}`;
    }
    return searchUrlPrefix;
  };

  const getNextPageLocation = () => {
    if (getEndIndex() >= search.number_of_results) {
      return null;
    }
    return buildSearchUrlAtOffset(getBeginIndex() + pageSize);
  };

  const getPreviousPageLocation = () => {
    if (getBeginIndex() <= 0) {
      return null;
    }
    return buildSearchUrlAtOffset(getBeginIndex() - pageSize);
  };

  // Remove any malformed, partially formed or empty values from query
  const cleanupQuery = (oldQuery) => {
    const cleanQuery = { ...oldQuery };
    if (oldQuery.team_tasks) {
      cleanQuery.team_tasks = oldQuery.team_tasks.filter(tt => (
        tt.id && tt.response && tt.task_type
      ));
      if (!cleanQuery.team_tasks.length) {
        delete cleanQuery.team_tasks;
      }
    }
    if (oldQuery.range) {
      const datesObj =
        oldQuery.range.created_at ||
        oldQuery.range.updated_at ||
        oldQuery.range.media_published_at ||
        oldQuery.range.report_published_at || {};
      const relativeCondition = ['less_than', 'more_than'].includes(datesObj.condition);
      if ((!datesObj.start_time && !datesObj.end_time) && (!relativeCondition)) {
        delete cleanQuery.range;
      }
      if (relativeCondition && datesObj.period === 0) {
        delete cleanQuery.range;
      }
    }
    Object.keys(oldQuery).forEach((key) => {
      if (Array.isArray(cleanQuery[key]) && (cleanQuery[key].length === 0)) {
        delete cleanQuery[key];
      }
    });
    return cleanQuery;
  };

  /*
  when clicking on the "clear search" button, we call the handleSubmit passing the newQuery.
  If does not have the newQuery param get the query from props
  */
  const handleSubmit = (e, newQuery) => {
    const cleanQuery = cleanupQuery(newQuery || query);
    handleChangeQuery(cleanQuery);
  };

  /**
   * Build a URL for the 'ProjectMedia' page.
   *
   * The URL will have a `listIndex` (so the ProjectMedia page can paginate). It
   * will also include `listPath` and `listQuery` ... _unless_ those parameters
   * are redundant. (For instance, if the query is
   * `{ timestamp, esoffset }` then the result can be `{}`
   * because enough data is in `mediaUrlPrefix` to infer the properties.
   */
  const buildProjectMediaUrl = (projectMedia) => {
    if (!projectMedia.dbid) {
      return null;
    }

    const cleanQuery = simplifyQuery(query);
    const itemIndexInPage = search.medias.edges.findIndex(edge => edge.node === projectMedia);
    const listIndex = getBeginIndex() + itemIndexInPage;
    const urlParams = new URLSearchParams();
    if (searchUrlPrefix.match('(/trash|/tipline-inbox|/imported-fact-checks|/tipline-inbox|/suggested-matches|/unmatched-media|/spam|(/feed/[0-9]+/(shared|feed)))$')) {
      // Usually, `listPath` can be inferred from the route params. With `trash` it can't,
      // so we'll give it to the receiving page. (See <MediaPage>.)
      urlParams.set('listPath', searchUrlPrefix);
    }

    if (Object.keys(cleanQuery).length > 0) {
      urlParams.set('listQuery', JSON.stringify(cleanQuery));
    }
    urlParams.set('listIndex', String(listIndex));

    let urlPrefix = mediaUrlPrefix;
    // If it's not an absolute path, prepend the team slug
    if (!/^\//.test(urlPrefix) && projectMedia.team && projectMedia.team.slug) {
      urlPrefix = `/${projectMedia.team.slug}/${urlPrefix}`;
    }

    let result = `${urlPrefix}/${projectMedia.dbid}?${urlParams.toString()}`;
    if (resultType === 'feed') {
      result = `${mediaUrlPrefix}/cluster/${projectMedia.cluster?.dbid}?${urlParams.toString()}`;
    }

    return result;
  };

  React.useEffect(() => {
    resubscribe();

    return function cleanup() {
      unsubscribe();
    };
  });

  const projectMedias = search.medias
    ? search.medias.edges.map(({ node }) => node)
    : [];

  let count = search.number_of_results;
  const { team } = search;
  const isIdInSearchResults = wantedId => projectMedias.some(({ id }) => id === wantedId);
  const filteredSelectedProjectMediaIds = selectedProjectMediaIds.filter(isIdInSearchResults);

  const sortParams = query.sort ? {
    key: query.sort,
    ascending: query.sort_type !== 'DESC',
  } : {
    key: 'recent_added',
    ascending: false,
  };

  const selectedProjectMedia = [];

  projectMedias.forEach((pm) => {
    if (filteredSelectedProjectMediaIds.indexOf(pm.id) !== -1) {
      selectedProjectMedia.push(pm);
    }
  });

  let content = null;

  // Return nothing if feed doesn't have a list
  if (resultType === 'factCheck' && !feed.saved_search_id) {
    count = 0;
  }

  if (count === 0) {
    content = (
      <BlankState>
        <FormattedMessage
          id="projectBlankState.blank"
          defaultMessage="There are no items here."
          description="Empty message that is displayed when search results are zero"
        />
      </BlankState>
    );
    if (resultType === 'factCheck') {
      content = (
        <FeedBlankState
          teamSlug={team.slug}
          feedDbid={feed.dbid}
          listDbid={feed.saved_search_id}
        />
      );
    }
  } else {
    content = (
      <SearchResultsTable
        projectMedias={projectMedias}
        team={team}
        selectedIds={filteredSelectedProjectMediaIds}
        sortParams={sortParams}
        onChangeSelectedIds={handleChangeSelectedIds}
        onChangeSortParams={handleChangeSortParams}
        buildProjectMediaUrl={buildProjectMediaUrl}
        resultType={resultType}
        count={count}
      />
    );
    if (resultType === 'factCheck') {
      content = (
        <SearchResultsCards
          team={team}
          projectMedias={projectMedias}
        />
      );
    }
  }

  const feeds = savedSearch?.feeds?.edges.map(edge => edge.node.name);

  return (
    <React.Fragment>
      <div className={styles['search-results-header']}>
        <div className="search__list-header-filter-row">
          <div className={cx('project__title', styles.searchResultsTitleWrapper)}>
            <div className={styles.searchHeaderSubtitle}>
              { listSubtitle ?
                <>
                  {listSubtitle}
                </>
                :
                <>
                  &nbsp;
                </>
              }
            </div>
            <div className={cx('project__title-text', styles.searchHeaderTitle)}>
              <h6>
                {icon}
                {title}
              </h6>
              { (savedSearch?.is_part_of_feeds || listActions) &&
                <div className={styles.searchHeaderActions}>
                  { savedSearch?.is_part_of_feeds ?
                    <Tooltip
                      title={
                        <>
                          <FormattedMessage
                            id="sharedFeedIcon.Tooltip"
                            defaultMessage="Included in Shared Feed:"
                            description="Tooltip for shared feeds icon"
                          />
                          <ul className="bulleted-list item-limited-list">
                            {feeds.map(feedObj => (
                              <li key={feedObj.id}>{feedObj}</li>
                            ))}
                          </ul>
                        </>
                      }
                      arrow
                    >
                      <span id="shared-feed__icon">{/* Wrapper span is required for the tooltip to a ref for the mui Tooltip */}
                        <ButtonMain variant="outlined" size="small" theme="text" iconCenter={<FeedIcon />} className={styles.searchHeaderActionButton} />
                      </span>
                    </Tooltip>
                    :
                    null }
                  {listActions}
                </div>
              }
            </div>
          </div>
          { resultType !== 'factCheck' ?
            <SearchKeyword
              query={query}
              setQuery={setQuery}
              title={title}
              team={team}
              showExpand={showExpand}
              cleanupQuery={cleanupQuery}
              handleSubmit={handleSubmit}
            /> : null }
        </div>
      </div>

      <div className={cx('search__results-top', styles['search-results-top'])}>
        { extra ? <Box mb={2} ml={2}>{extra(query)}</Box> : null }
        <Box m={2}>
          <SearchFields
            query={query}
            currentQuery={currentQuery}
            defaultQuery={defaultQuery}
            setQuery={setQuery}
            onChange={handleChangeQuery}
            feedTeam={feedTeam}
            feed={feed}
            savedSearch={savedSearch}
            hideFields={hideFields}
            readOnlyFields={readOnlyFields}
            title={title}
            team={team}
            page={page}
            handleSubmit={handleSubmit}
          />
        </Box>
      </div>
      <div className={cx('search__results', 'results', styles['search-results-wrapper'])}>
        <Toolbar
          resultType={resultType}
          team={team}
          actions={
            projectMedias.length && selectedProjectMedia.length ?
              <BulkActions
                team={team}
                page={page}
                selectedProjectMedia={selectedProjectMedia}
                selectedMedia={filteredSelectedProjectMediaIds}
                onUnselectAll={onUnselectAll}
              /> : null
          }
          title={count ?
            <span className={cx('search__results-heading', 'results', styles['search-results-heading'])}>
              { resultType === 'factCheck' && feed ?
                <ListSort
                  sort={query.sort}
                  sortType={query.sort_type}
                  onChange={({ sort, sortType }) => { handleChangeSortParams({ key: sort, ascending: (sortType === 'ASC') }); }}
                /> : null
              }
              <span className={styles['search-pagination']}>
                <Tooltip title={
                  <FormattedMessage id="search.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page" />
                }
                >
                  {getPreviousPageLocation() ? (
                    <Link
                      className={cx('search__previous-page', styles['search-nav'])}
                      to={getPreviousPageLocation()}
                    >
                      <PrevIcon />
                    </Link>
                  ) : (
                    <span className={cx('search__previous-page', styles['search-button-disabled'], styles['search-nav'])}>
                      <PrevIcon />
                    </span>
                  )}
                </Tooltip>
                <span className="typography-button">
                  <FormattedMessage
                    id="searchResults.itemsCount"
                    defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
                    description="Pagination count of items returned"
                    values={{
                      from: getBeginIndex() + 1,
                      to: getEndIndex(),
                      count,
                    }}
                  />
                  {filteredSelectedProjectMediaIds.length ?
                    <FormattedMessage
                      id="searchResults.withSelection"
                      defaultMessage="{selectedCount, plural, one {(# selected)} other {(# selected)}}"
                      description="Label for number of selected items"
                      values={{
                        selectedCount: filteredSelectedProjectMediaIds.length,
                      }}
                    >
                      {txt => <span className={styles['search-selected']}>{txt}</span>}
                    </FormattedMessage>
                    : null
                  }
                </span>
                <Tooltip title={
                  <FormattedMessage id="search.nextPage" defaultMessage="Next page" description="Pagination button to go to next page" />
                }
                >
                  {getNextPageLocation() ? (
                    <Link className={cx('search__next-page', styles['search-nav'])} to={getNextPageLocation()}>
                      <NextIcon />
                    </Link>
                  ) : (
                    <span className={cx('search__next-page', styles['search-button-disabled'], styles['search-nav'])}>
                      <NextIcon />
                    </span>
                  )}
                </Tooltip>
              </span>
            </span> : null
          }
          page={page}
          search={search}
        />
        {content}
      </div>
    </React.Fragment>
  );
}

SearchResultsComponent.defaultProps = {
  showExpand: false,
  icon: null,
  listActions: undefined,
  resultType: 'default',
  hideFields: [],
  readOnlyFields: [],
  savedSearch: null,
  feedTeam: null,
  feed: null,
  listSubtitle: null,
  extra: null,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  search: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    medias: PropTypes.shape({ edges: PropTypes.array.isRequired }).isRequired,
  }).isRequired,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filters: PropTypes.object,
    feedFilters: PropTypes.object,
  }), // may be null
  feed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    saved_search_id: PropTypes.number,
  }), // may be null
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
  showExpand: PropTypes.bool,
  relay: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
  listSubtitle: PropTypes.object,
  icon: PropTypes.node,
  listActions: PropTypes.node, // or undefined
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  resultType: PropTypes.string, // 'default' or 'feed', for now
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  savedSearch: PropTypes.object, // or null
  extra: PropTypes.node, // or null
};

// eslint-disable-next-line import/no-unused-modules
export { SearchResultsComponent as SearchResultsComponentTest };

const SearchResultsContainer = Relay.createContainer(withPusher(SearchResultsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        team {
          ${BulkActions.getFragment('team')}
          ${SearchKeyword.getFragment('team')}
          ${SearchFields.getFragment('team')}
          id
          slug
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          check_search_spam { id, number_of_results },
          verification_statuses,
          list_columns,
          medias_count,
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          },
          alegre_bot: team_bot_installation(bot_identifier: "alegre") {
            id
            alegre_settings
          }
        }
        medias(first: $pageSize) {
          edges {
            node {
              id
              dbid
              picture
              show_warning_cover
              title
              description
              is_read
              is_main
              is_secondary
              is_suggested
              is_confirmed
              report_status # Needed by BulkActionsStatus
              requests_count
              list_columns_values
              feed_columns_values
              last_seen
              source_id
              cluster {
                dbid
                size
                team_names
                fact_checked_by_team_names
                requests_count
                first_item_at
                last_item_at
              }
              team {
                slug
                verification_statuses
              }
            }
          }
        },
        number_of_results
      }
    `,
  },
});

/**
 * Build JSON-stringified query string that replicates check-api's warts.
 *
 * TL;DR when given `{projects: [projectId]}` or `{}` as input, return an
 * equivalent query that looks like the one `check-api` assumes.
 *
 * A long explanation follows -- [adamhooper, 2020-05-22] it took me hours to
 * figure this out.
 *
 * A CheckSearch has an `id`, to mimic GraphQL: check-api is designed to
 * encourage the client to store a CheckSearch in its `Relay.Store` (even though
 * CheckSearch is not stored anywhere on the server).
 *
 * What happens when the client alters a list? Well, that should change the
 * search results ... so check-api's UpdateProjectMediaPayload includes
 * `check_search_project`, `check_search_team` and `check_search_trash` based
 * on **check-api's guesses** of what the client-side IDs are.
 *
 * Check-api can't know the client-side IDs. So it guesses that they look like
 * `b64('CheckSearch/{"parent":{"type":"project","id":32},"projects":[32]}`)`.
 * The ordering must be exact. Luckily, MRI Ruby (check-api server side) happens
 * to JSON-encode Hash literals in deterministic order; and so does ES2015.
 *
 * This solution could never handle filters or sorting. (The search ID is based
 * on *all* parameters -- including filters/sorts.) So this is quasi-GraphQL.
 * TODO design `team.project_medias` and `project.project_medias`, filterable
 * GraphQL Connections, and nix `CheckSearch` (and these IDs).
 *
 * One other spot for confusion is in the GraphQL property,
 * `CheckSearch.pusher_channel`. Avoid it, because it's null if there are sorts
 * or filters -- and if you're reading the `pusher_channel` you can correctly
 * determine the pusher channel, client-side.
 */
function encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug) {
  const nKeys = Object.keys(query).length;
  if (nKeys === 0) {
    return `{"parent":{"type":"team","slug":${JSON.stringify(teamSlug)}}}`;
  }
  // In all but these two cases, generate a separate query.
  return JSON.stringify(query);
}

export default function SearchResults({ query, teamSlug, ...props }) {
  const jsonEncodedQuery = encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug);

  const route = React.useMemo(() => new SearchRoute({
    jsonEncodedQuery,
  }), [jsonEncodedQuery]);

  return (
    <Relay.RootContainer
      Component={SearchResultsContainer}
      route={route}
      forceFetch
      renderFetched={data => (
        <SearchResultsContainer {...props} query={query} search={data.search} />
      )}
      renderLoading={() => <MediasLoading theme="grey" variant="page" size="large" />}
    />
  );
}

SearchResults.propTypes = {
  listSubtitle: PropTypes.object,
  query: PropTypes.object.isRequired,
  teamSlug: PropTypes.string.isRequired,
  extra: PropTypes.node,
};

SearchResults.defaultProps = {
  extra: null,
  listSubtitle: null,
};
