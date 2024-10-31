/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import cx from 'classnames/bind';
import SearchKeyword from './SearchKeyword';
import SearchFields from './SearchFields';
import SelectAllCheckbox from './SelectAllCheckbox';
import SearchResultsCards from './SearchResultsCards';
import ClusterCard from './SearchResultsCards/ClusterCard';
import { withPusher, pusherShape } from '../../pusher';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import ExportList from '../ExportList';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import BulkActionsMenu from '../media/BulkActionsMenu';
import Loader from '../cds/loading/Loader';
import BlankState from '../layout/BlankState';
import FeedBlankState from '../feed/FeedBlankState';
import SearchRoute from '../../relay/SearchRoute';
import { pageSize } from '../../urlHelpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './SearchResults.module.css';

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
  return ret;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
function SearchResultsComponent({
  clientSessionId,
  defaultQuery,
  extra,
  feed,
  feedTeam,
  hideFields,
  icon,
  listActions,
  listSubtitle,
  mediaUrlPrefix,
  page,
  pusher,
  query: appliedQuery,
  readOnlyFields,
  relay,
  resultType,
  savedSearch,
  search,
  searchUrlPrefix,
  showExpand,
  title,
}) {
  let pusherChannel = null;
  const [selectedProjectMediaIds, setSelectedProjectMediaIds] = React.useState([]);
  const [tooManyResults, setTooManyResults] = React.useState(false);
  const [stateQuery, setStateQuery] = React.useState(appliedQuery);

  const onUnselectAll = () => {
    setSelectedProjectMediaIds([]);
  };

  const getBeginIndex = () => parseInt(stateQuery.esoffset /* may be invalid */, 10) || 0;

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
    const newQuery = { ...stateQuery };
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
    if (stateQuery.sort) {
      cleanQuery.sort = stateQuery.sort;
    }
    if (stateQuery.sort_type) {
      cleanQuery.sort_type = stateQuery.sort_type;
    }
    if (newQuery.sort === 'clear') {
      delete cleanQuery.sort;
      delete cleanQuery.sort_type;
    }
    navigateToQuery(cleanQuery);
  };

  const buildSearchUrlAtOffset = (offset) => {
    const cleanQuery = simplifyQuery(stateQuery);
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
    const cleanQuery = cleanupQuery(newQuery || stateQuery);
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

    const cleanQuery = simplifyQuery(stateQuery);
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

    const result = `${urlPrefix}/${projectMedia.dbid}?${urlParams.toString()}`;
    return result;
  };

  /**
   * After 10k results, Elastic Search stops returning items,
   * user needs to be prompted to shorten their search
   */
  const handleNextPageClick = () => {
    if (getEndIndex() < 10000) {
      browserHistory.push(getNextPageLocation());
    } else {
      setTooManyResults(true);
    }
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

  const selectedProjectMedia = [];

  projectMedias.forEach((pm) => {
    if (filteredSelectedProjectMediaIds.indexOf(pm.id) !== -1) {
      selectedProjectMedia.push(pm);
    }
  });

  const handleCheckboxChange = (checked, projectMedia) => {
    const { id } = projectMedia;
    if (!id) return; // Can't select unsaved object. Swallow mouse click.

    let newIds;
    if (checked) {
      // Add
      if (filteredSelectedProjectMediaIds.includes(id)) {
        return;
      }
      newIds = [...filteredSelectedProjectMediaIds, id];
      newIds.sort((a, b) => a - b);
    } else {
      // Remove
      if (!filteredSelectedProjectMediaIds.includes(id)) {
        return;
      }
      newIds = filteredSelectedProjectMediaIds.filter(oldId => oldId !== id);
    }
    setSelectedProjectMediaIds(newIds);
  };

  let content = null;

  // Return nothing if feed doesn't have a list
  if (feed && !feed.saved_search_id && resultType === 'factCheck') {
    count = 0;
  }

  // Return nothing if feed is forced empty (we have deselected all orgs)
  if (resultType === 'emptyFeed') {
    count = 0;
  }

  if (count === 0) {
    content = (
      <BlankState>
        <FormattedMessage
          defaultMessage="There are no items here."
          description="Empty message that is displayed when search results are zero"
          id="projectBlankState.blank"
        />
      </BlankState>
    );
    if (feed && (resultType === 'factCheck' || resultType === 'emptyFeed')) {
      content = (
        <FeedBlankState
          feedDbid={feed.dbid}
          listDbid={feed.saved_search_id}
          teamSlug={team.slug}
        />
      );
    }
  } else {
    content = resultType === 'factCheck' ? (
      <SearchResultsCards
        projectMedias={projectMedias}
        team={team}
      />
    ) : (
      <div className={styles['search-results-scroller']}>
        { projectMedias.map((item) => {
          const numberOfRequests = item.is_confirmed_similar_to_another_item ? item.requests_count : item.demand;

          const factCheckCount = item.fact_check_id ? 1 : 0;

          return (
            <ClusterCard
              articlesCount={item.articles_count}
              cardUrl={buildProjectMediaUrl(item)}
              channels={numberOfRequests && item.channel}
              date={new Date(+item.updated_at * 1000)}
              description={item.description}
              factCheckCount={factCheckCount}
              isChecked={filteredSelectedProjectMediaIds.includes(item.id)}
              isPublished={item.report_status === 'published'}
              isUnread={!item.is_read}
              key={item.id}
              lastRequestDate={numberOfRequests && new Date(+item.last_seen * 1000)}
              mediaCount={item.linked_items_count}
              mediaThumbnail={{
                media: {
                  picture: item.picture,
                  type: item.media?.type,
                  url: item.media?.url,
                },
                show_warning_cover: item.show_warning_cover,
              }}
              mediaType={item.media?.type}
              publishedAt={item.fact_check_published_on ? new Date(+item.fact_check_published_on * 1000) : null}
              rating={item.team?.verification_statuses.statuses.find(s => s.id === item.status)?.label}
              ratingColor={item.team?.verification_statuses.statuses.find(s => s.id === item.status)?.style.color}
              requestsCount={numberOfRequests}
              suggestionsCount={item.suggestions_count}
              title={item.title}
              onCheckboxChange={(checked) => { handleCheckboxChange(checked, item); }}
            />
          );
        })}
      </div>
    );
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
                      arrow
                      title={
                        <>
                          <FormattedMessage
                            defaultMessage="Included in Shared Feed:"
                            description="Tooltip for shared feeds icon"
                            id="sharedFeedIcon.Tooltip"
                          />
                          <ul className="bulleted-list item-limited-list">
                            {feeds.map(feedName => (
                              <li key={feedName}>{feedName}</li>
                            ))}
                          </ul>
                        </>
                      }
                    >
                      <span id="shared-feed__icon">{/* Wrapper span is required for the tooltip to a ref for the mui Tooltip */}
                        <ButtonMain className={styles.searchHeaderActionButton} iconCenter={<SharedFeedIcon />} size="small" theme="text" variant="outlined" />
                      </span>
                    </Tooltip>
                    :
                    null }
                  {listActions}
                </div>
              }
            </div>
          </div>
          <SearchKeyword
            cleanupQuery={cleanupQuery}
            handleSubmit={handleSubmit}
            query={stateQuery}
            setStateQuery={setStateQuery}
            showExpand={showExpand}
            team={team}
            title={title}
          />
        </div>
      </div>
      <div className={cx('search__results-top', styles['search-results-top'])}>
        { extra ? <div className={styles['search-results-top-extra']}>{extra(stateQuery)}</div> : null }
        <SearchFields
          appliedQuery={appliedQuery}
          defaultQuery={defaultQuery}
          feed={feed}
          feedTeam={feedTeam}
          handleSubmit={handleSubmit}
          hideFields={hideFields}
          page={page}
          readOnlyFields={readOnlyFields}
          savedSearch={savedSearch}
          setStateQuery={setStateQuery}
          stateQuery={stateQuery}
          team={team}
          title={title}
          onChange={handleChangeQuery}
          onChangeSort={handleChangeSortParams}
        />
      </div>
      <div className={cx('search__results', 'results', styles['search-results-wrapper'])}>
        { tooManyResults ?
          <Alert
            contained
            title={
              <FormattedMessage
                defaultMessage="Browsing this list is limited to the first {max, number} results. Use the filters above to refine this list."
                description="An alert message that informs the user that their query is too large and need to narrow their filters if they want to continue search for items."
                id="searchResults.tooManyResults"
                values={{
                  max: 10000,
                }}
              />}
            variant="info"
          /> : null
        }
        { count > 0 ?
          <div className={cx(styles['search-results-toolbar'], 'toolbar', `toolbar__${resultType}`)}>
            <span className={cx('search__results-heading', 'results', styles['search-results-heading'])}>
              <div className={styles['search-results-bulk-actions']}>
                { resultType === 'default' && (
                  <SelectAllCheckbox
                    className={styles.noBottomBorder}
                    projectMedias={projectMedias}
                    selectedIds={filteredSelectedProjectMediaIds}
                    onChangeSelectedIds={handleChangeSelectedIds}
                  />
                )}
                { projectMedias.length && selectedProjectMedia.length ?
                  <BulkActionsMenu
                  /*
                  FIXME: The `selectedMedia` prop above contained IDs only, so I had to add the `selectedProjectMedia` prop
                  below to contain the PM objects as the tagging mutation currently requires dbids and
                  also for other requirements such as warning about published reports before bulk changing statuses
                  additional data is needed.
                  I suggest refactoring this later to nix the ID array and pass the ProjectMedia array only.
                  */
                    page={page}
                    selectedMedia={filteredSelectedProjectMediaIds}
                    selectedProjectMedia={selectedProjectMedia}
                    team={team}
                    onUnselectAll={onUnselectAll}
                  /> : null
                }
              </div>
              <div className={styles['search-actions']}>
                <span className={styles['search-pagination']}>
                  <Tooltip title={
                    <FormattedMessage defaultMessage="Previous page" description="Pagination button to go to previous page" id="search.previousPage" />
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
                      defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
                      description="Pagination count of items returned"
                      id="searchResults.itemsCount"
                      values={{
                        from: getBeginIndex() + 1,
                        to: getEndIndex(),
                        count,
                      }}
                    />
                  </span>
                  <Tooltip title={
                    <FormattedMessage defaultMessage="Next page" description="Pagination button to go to next page" id="search.nextPage" />
                  }
                  >
                    {getNextPageLocation() ? (
                      <span className={cx('search__next-page', styles['search-nav'])} onClick={() => handleNextPageClick()}>
                        <NextIcon />
                      </span>
                    ) : (
                      <span className={cx('search__next-page', styles['search-button-disabled'], styles['search-nav'])}>
                        <NextIcon />
                      </span>
                    )}
                  </Tooltip>
                </span>
                <ExportList filters={appliedQuery} type="media" />
              </div>
            </span>
          </div> : null
        }
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
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash', 'assigned-to-me']).isRequired, // FIXME Define listing types as a global constant
  resultType: PropTypes.string, // 'default' or 'feed', for now
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  savedSearch: PropTypes.object, // or null
  extra: PropTypes.func, // or null
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
          ${SearchKeyword.getFragment('team')}
          ${SearchFields.getFragment('team')}
          id
          slug
          name
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          check_search_spam { id, number_of_results },
          verification_statuses,
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
              channel
              picture
              show_warning_cover
              title
              description
              updated_at
              is_read
              is_main
              type
              url
              is_secondary
              is_suggested
              is_confirmed
              is_confirmed_similar_to_another_item
              status
              report_status # Needed by BulkActionsStatus
              fact_check_id
              fact_check_published_on
              articles_count
              requests_count
              demand
              linked_items_count
              suggestions_count
              last_seen
              feed_columns_values
              source_id
              media {
                type
                url
                domain
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
      forceFetch
      renderFetched={data => (
        <SearchResultsContainer {...props} query={query} search={data.search} />
      )}
      renderLoading={() => <Loader size="large" theme="white" variant="page" />}
      route={route}
    />
  );
}

SearchResults.propTypes = {
  listSubtitle: PropTypes.object,
  query: PropTypes.object.isRequired,
  teamSlug: PropTypes.string.isRequired,
  extra: PropTypes.func,
};

SearchResults.defaultProps = {
  extra: null,
  listSubtitle: null,
};
