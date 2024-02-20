import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import KeyboardArrowUpIcon from '../../icons/chevron_up.svg';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import FeedFilters from './FeedFilters';
import TitleCell from '../search/SearchResultsTable/TitleCell';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import SearchKeyword from '../search/SearchKeyword';
import BlankState from '../layout/BlankState';
import styles from '../search/SearchResults.module.css';

const FeedRequestsTable = ({
  tabs,
  feed,
  feedTeam,
  searchUrlPrefix,
  sort,
  sortType,
  filters,
  onChangeSort,
  onChangeSortType,
  onChangeFilters,
  onGoToTheNextPage,
  onGoToThePreviousPage,
  rangeStart,
  rangeEnd,
  hasNextPage,
  hasPreviousPage,
}) => {
  const buildItemUrl = (requestDbid) => {
    const urlParams = new URLSearchParams();
    urlParams.set('listPath', searchUrlPrefix);
    urlParams.set('listQuery', JSON.stringify(filters));
    return `/check/feed/${feed.dbid}/request/${requestDbid}?${urlParams.toString()}`;
  };

  const mediaType = requestType => ({
    Claim: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeText"
        defaultMessage="Text"
        description="Label for feed request media type"
      />
    ),
    Link: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeLink"
        defaultMessage="Link"
        description="Label for feed request media type"
      />
    ),
    UploadedImage: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeImage"
        defaultMessage="Image"
        description="Label for feed request media type"
      />
    ),
    UploadedAudio: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeAudio"
        defaultMessage="Audio"
        description="Label for feed request media type"
      />
    ),
    UploadedVideo: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeVideo"
        defaultMessage="Video"
        description="Label for feed request media type"
      />
    ),
  }[requestType] || '-');

  const toggleSortType = () => {
    onChangeSortType(sortType === 'desc' ? 'asc' : 'desc');
  };

  const TableSort = ({ children, field }) => (
    <TableSortLabel
      key={`${field}-${sortType}`}
      active={sort === field}
      IconComponent={(sortType === 'desc' ? KeyboardArrowUpIcon : KeyboardArrowDownIcon)}
      onClick={() => {
        if (sort === field) {
          toggleSortType();
        } else {
          onChangeSort(field);
        }
      }}
    >
      {children}
    </TableSortLabel>
  );

  const { totalCount } = feed.requests;

  return (
    <React.Fragment>
      <div className={styles['search-results-header']}>
        <div className="search__list-header-filter-row">
          <div className={cx('project__title', styles.searchResultsTitleWrapper)}>
            <div className={styles.searchHeaderSubtitle}>
              Shared Feed
            </div>
            <div className={cx('project__title-text', styles.searchHeaderTitle)}>
              <h6>
                {feed.name}
              </h6>
            </div>
          </div>
          <SearchKeyword
            query={{ keyword: filters.keyword }}
            team={{ verification_statuses: {} }}
            setStateQuery={(query) => {
              // Clear
              if (!query.keyword || query.keyword === '') {
                const newFilters = { ...filters };
                delete newFilters.keyword;
                onChangeFilters(newFilters);
              }
            }}
            showExpand={false}
            cleanupQuery={query => query}
            handleSubmit={(e) => {
              const newFilters = { ...filters, keyword: e?.target['search-input']?.value };
              onChangeFilters(newFilters);
              e?.preventDefault();
            }}
            hideAdvanced
          />
        </div>
        { typeof tabs === 'function' && tabs({}) }
      </div>
      <FeedFilters onSubmit={onChangeFilters} currentFilters={filters} feedTeam={feedTeam} />
      <div className={cx('search__results', 'results', styles['search-results-wrapper'])}>
        {totalCount ?
          <div className={styles['search-results-toolbar']}>
            <span className={cx('search__results-heading', 'results', styles['search-results-heading'])}>
              <span className={cx(styles['search-pagination'], styles['ine-pager'])}>
                <ButtonMain
                  size="small"
                  variant="text"
                  theme="text"
                  className={styles['search-nav']}
                  onClick={onGoToThePreviousPage}
                  disabled={!hasPreviousPage}
                  iconCenter={<PrevIcon />}
                />
                <span className="typography-button">{rangeStart > totalCount ? totalCount : rangeStart} - {rangeEnd > totalCount ? totalCount : rangeEnd} / {totalCount}</span>
                <ButtonMain
                  size="small"
                  variant="text"
                  theme="text"
                  onClick={onGoToTheNextPage}
                  disabled={!hasNextPage}
                  iconCenter={<NextIcon />}
                />
              </span>
            </span>
          </div>
          : null }
        {totalCount === 0 ?
          <BlankState>
            <FormattedMessage
              id="projectBlankState.blank"
              defaultMessage="There are no items here."
              description="Message displayed when there are no items"
            />
          </BlankState>
          :
          <div className={styles['search-results-table-wrapper']}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage
                      id="feedRequestsTable.media"
                      defaultMessage="Media"
                      description="Header label for media column. Media can be any piece of content, i.e. an image, a video, an url, a piece of text"
                    />
                  </TableCell>
                  <TableCell>
                    <TableSort field="last_submitted">
                      <FormattedMessage
                        id="feedRequestsTable.lastSubmitted"
                        defaultMessage="Last submitted"
                        description="Header label for date column, in which are shown timestamps of last time a media was sent"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell>
                    <TableSort field="media_type">
                      <FormattedMessage
                        id="feedRequestsTable.mediaType"
                        defaultMessage="Media type"
                        description="Header label for media type column, in which are shown the type of the media associated with the request"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell align="left">
                    <TableSort field="requests">
                      <FormattedMessage
                        id="feedRequestsTable.requests"
                        defaultMessage="Requests"
                        description="Header label for number of requests column"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell align="left">
                    <TableSort field="subscriptions">
                      <FormattedMessage
                        id="feedRequestsTable.subscriptions"
                        defaultMessage="Subscriptions"
                        description="Header label for number of subscriptions column"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell align="left">
                    <TableSort field="fact_checks">
                      <FormattedMessage
                        id="feedRequestsTable.factChecksSent"
                        defaultMessage="Fact-checks sent"
                        description="Header label for fact-checks sent column"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell align="left">
                    <TableSort field="fact_checked_by">
                      <FormattedMessage
                        id="feedRequestsTable.factCheckBy"
                        defaultMessage="Fact-check by"
                        description="Header label for fact-check by column"
                      />
                    </TableSort>
                  </TableCell>
                  <TableCell align="left">
                    <TableSort field="medias">
                      <FormattedMessage
                        id="feedRequestsTable.matchedMedia"
                        defaultMessage="Media"
                        description="Header label for number of medias found to be matched to the current one"
                      />
                    </TableSort>
                  </TableCell>
                </TableRow>
              </TableHead>
              <tbody>
                { feed?.requests?.edges?.map((r) => {
                  let requestTitle = '';
                  if (r.node.request_type === 'text') {
                    requestTitle = r.node.media?.quote || r.node.media?.metadata?.title;
                  } else {
                    requestTitle = r.node.title;
                  }
                  const requestPicture = r.node.request_type === 'audio' ? '/images/image_placeholder.svg' : r.node.media?.picture;

                  // This means a request for the latest fact-checks
                  if (r.node.request_type === 'text' && r.node.content === '.') {
                    return null;
                  }

                  return (
                    <TableRow
                      key={r.node.id}
                      className={cx(styles['search-results-row'], styles['search-results-read'])}
                      onClick={() => browserHistory.push(buildItemUrl(r.node.dbid))}
                    >
                      <TitleCell
                        projectMedia={{
                          title: requestTitle,
                          description: '',
                          picture: requestPicture,
                        }}
                      />
                      <TableCell>
                        <FormattedDate
                          value={r.node.last_submitted_at * 1000 || '-'}
                          year="numeric"
                          month="short"
                          day="2-digit"
                        />
                      </TableCell>
                      <TableCell align="left">{mediaType(r.node.media_type)}</TableCell>
                      <TableCell align="left">{Math.max(0, r.node.requests_count - r.node.subscriptions_count)}</TableCell>
                      <TableCell align="left">{r.node.subscriptions_count}</TableCell>
                      <TableCell align="left">{r.node.project_medias_count}</TableCell>
                      <TableCell align="left">
                        {
                          r.node.fact_checked_by ?
                            <div className={styles['ine-fact-check']}>
                              {r.node.fact_checked_by.split(', ').map(teamName => (<span key={teamName}>{teamName}<br /></span>))}
                            </div> :
                            <div className={styles['ine-no-fact-check']}>
                              <FormattedMessage
                                id="feedRequestsTable.noFactCheck"
                                defaultMessage="No fact-check"
                                description="Displayed on feed requests table when a request was not fact-checked yet."
                              />
                            </div>
                        }
                      </TableCell>
                      <TableCell align="left">{r.node.medias_count}</TableCell>
                    </TableRow>
                  );
                }) }
              </tbody>
            </Table>
          </div>
        }
      </div>
    </React.Fragment>
  );
};

FeedRequestsTable.propTypes = {};

const FeedRequestsTableQuery = ({
  teamSlug,
  feedId,
  feedTeam,
  tabs,
  searchUrlPrefix,
  filters,
}) => {
  const pageSize = 50;
  const page = filters.page || 1;
  const sort = filters.sort || 'last_submitted';
  const sortType = filters.sortType || 'desc';

  const setSearchParam = (name, value) => {
    const params = { ...filters };
    params[name] = value;
    browserHistory.push(`/${teamSlug}/feed/${feedId}/requests/${JSON.stringify(params)}`);
  };

  const setFilters = (newFilters) => {
    const params = { ...newFilters, page: 1, timestamp: new Date().getTime() };
    browserHistory.push(`/${teamSlug}/feed/${feedId}/requests/${JSON.stringify(params)}`);
  };

  return (
    <ErrorBoundary component="FeedRequestsTable">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedRequestsTableQuery($teamSlug: String!, $feedId: Int!, $offset: Int!, $pageSize: Int!, $sort: String, $sortType: String, $mediasCountMin: Int, $mediasCountMax: Int,
                                       $requestsCountMin: Int, $requestsCountMax: Int, $requestCreatedAt: String, $factCheckedBy: String, $keyword: String) {
            team(slug: $teamSlug) {
              feed(dbid: $feedId) {
                dbid
                name
                requests(first: $pageSize, offset: $offset, sort: $sort, sort_type: $sortType, medias_count_min: $mediasCountMin, medias_count_max: $mediasCountMax,
                         requests_count_min: $requestsCountMin, requests_count_max: $requestsCountMax, request_created_at: $requestCreatedAt, fact_checked_by: $factCheckedBy, keyword: $keyword) {
                  totalCount
                  edges {
                    node {
                      id
                      dbid
                      content
                      last_submitted_at
                      requests_count
                      medias_count
                      subscriptions_count
                      project_medias_count
                      fact_checked_by
                      title
                      request_type
                      media_type
                      media {
                        metadata
                        quote
                        picture
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        variables={{
          teamSlug,
          feedId,
          offset: (page - 1) * pageSize,
          pageSize,
          sort,
          sortType,
          mediasCountMin: filters.linked_items_count?.min,
          mediasCountMax: filters.linked_items_count?.max,
          requestsCountMin: filters.demand?.min,
          requestsCountMax: filters.demand?.max,
          requestCreatedAt: filters.range?.request_created_at ? JSON.stringify(filters.range?.request_created_at) : null,
          factCheckedBy: ['ANY', 'NONE'].includes(filters.feed_fact_checked_by) ? filters.feed_fact_checked_by : null,
          keyword: filters.keyword,
        }}
        render={({ props, error }) => {
          if (!error && !props) {
            return <MediasLoading theme="grey" variant="page" size="large" />;
          }

          if (props && !error) {
            return (
              <FeedRequestsTable
                key={page}
                tabs={tabs}
                feed={props.team?.feed}
                feedTeam={feedTeam}
                searchUrlPrefix={searchUrlPrefix}
                sort={sort}
                sortType={sortType}
                filters={filters}
                onChangeSort={(value) => { setSearchParam('sort', value); }}
                onChangeSortType={(value) => { setSearchParam('sortType', value); }}
                onChangeFilters={(value) => { setFilters(value); }}
                onGoToTheNextPage={() => { setSearchParam('page', page + 1); }}
                onGoToThePreviousPage={() => { setSearchParam('page', page - 1); }}
                rangeStart={((page - 1) * pageSize) + 1}
                rangeEnd={((page - 1) * pageSize) + pageSize}
                hasNextPage={(page * pageSize) < props.team?.feed?.requests?.totalCount}
                hasPreviousPage={page > 1}
              />);
          }
          return null;
        }}
      />
    </ErrorBoundary>
  );
};

FeedRequestsTableQuery.defaultProps = {
  filters: {},
  tabs: () => {},
};

FeedRequestsTableQuery.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedId: PropTypes.number.isRequired,
  tabs: PropTypes.func,
  searchUrlPrefix: PropTypes.string.isRequired,
  filters: PropTypes.object,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requests_filters: PropTypes.object,
  }).isRequired,
};

export default FeedRequestsTableQuery;
