import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableSortLabel,
} from '@material-ui/core';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import FeedFilters from './FeedFilters';
import ListHeader from '../layout/ListHeader';
import TitleCell from '../search/SearchResultsTable/TitleCell';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import SearchKeyword from '../search/SearchKeyword';
import { opaqueBlack03, opaqueBlack87 } from '../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    background: opaqueBlack03,
    textDecoration: 'none',
    height: '96px',
    '&:hover': {
      boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.25)',
      background: opaqueBlack03,
      transform: 'scale(1)',
    },
  },
  pager: {
    color: opaqueBlack87,
    fontSize: 'larger',
    fontWeight: 'bolder',
    textAlign: 'center',
  },
  noFactCheck: {
    fontSize: 12,
    fontWeight: 400,
    color: 'white',
    background: '#E78A00',
    display: 'inline-block',
    borderRadius: '50px',
    padding: '3px 10px',
    whiteSpace: 'nowrap',
  },
  hasFactCheck: {
    whiteSpace: 'nowrap',
  },
  tableHeadCell: {
    whiteSpace: 'nowrap',
  },
});

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
  const classes = useStyles();

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

  const TableContainerWithScrollbars = withStyles({
    root: {
      overflow: 'auto',
      display: 'block',
      maxWidth: 'calc(100vw - 256px)',
      maxHeight: 'calc(100vh - 270px)',
    },
  })(TableContainer);

  const { totalCount } = feed.requests;

  return (
    <React.Fragment>
      <Box mb={2}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <ListHeader listName={feed.name} icon={<DynamicFeedIcon />} />
          <Box p={2}>
            <SearchKeyword
              query={{ keyword: filters.keyword }}
              team={{ verification_statuses: {} }}
              setQuery={(query) => {
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
                const newFilters = { ...filters, keyword: e.target[0].value };
                onChangeFilters(newFilters);
                e.preventDefault();
              }}
              hideAdvanced
            />
          </Box>
        </Box>
        { tabs({}) }
      </Box>
      <Box>
        <FeedFilters onSubmit={onChangeFilters} currentFilters={filters} feedTeam={feedTeam} />
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton onClick={onGoToThePreviousPage} disabled={!hasPreviousPage}>
          <PrevIcon />
        </IconButton>
        <Box className={classes.pager}>{rangeStart} - {rangeEnd > totalCount ? totalCount : rangeEnd} / {totalCount}</Box>
        <IconButton onClick={onGoToTheNextPage} disabled={!hasNextPage}>
          <NextIcon />
        </IconButton>
      </Box>
      <TableContainerWithScrollbars>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeadCell}>
                <FormattedMessage
                  id="feedRequestsTable.media"
                  defaultMessage="Media"
                  description="Header label for media column. Media can be any piece of content, i.e. an image, a video, an url, a piece of text"
                />
              </TableCell>
              <TableCell className={classes.tableHeadCell}>
                <TableSort field="last_submitted">
                  <FormattedMessage
                    id="feedRequestsTable.lastSubmitted"
                    defaultMessage="Last submitted"
                    description="Header label for date column, in which are shown timestamps of last time a media was sent"
                  />
                </TableSort>
              </TableCell>
              <TableCell className={classes.tableHeadCell}>
                <TableSort field="media_type">
                  <FormattedMessage
                    id="feedRequestsTable.mediaType"
                    defaultMessage="Media type"
                    description="Header label for media type column, in which are shown the type of the media associated with the request"
                  />
                </TableSort>
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                <TableSort field="requests">
                  <FormattedMessage
                    id="feedRequestsTable.requests"
                    defaultMessage="Requests"
                    description="Header label for number of requests column"
                  />
                </TableSort>
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                <TableSort field="subscriptions">
                  <FormattedMessage
                    id="feedRequestsTable.subscriptions"
                    defaultMessage="Subscriptions"
                    description="Header label for number of subscriptions column"
                  />
                </TableSort>
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                <TableSort field="fact_checks">
                  <FormattedMessage
                    id="feedRequestsTable.factChecksSent"
                    defaultMessage="Fact-checks sent"
                    description="Header label for fact-checks sent column"
                  />
                </TableSort>
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                <TableSort field="fact_checked_by">
                  <FormattedMessage
                    id="feedRequestsTable.factCheckBy"
                    defaultMessage="Fact-check by"
                    description="Header label for fact-check by column"
                  />
                </TableSort>
              </TableCell>
              <TableCell align="left" className={classes.tableHeadCell}>
                <TableSort field="medias">
                  <FormattedMessage
                    id="feedRequestsTable.matchedMedia"
                    defaultMessage="Matched media"
                    description="Header label for number of medias found to be matched to the current one"
                  />
                </TableSort>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { feed?.requests?.edges.map((r) => {
              let requestTitle = '';
              if (r.node.request_type === 'text') {
                requestTitle = r.node.media?.quote || r.node.media?.metadata?.title;
              } else {
                requestTitle = r.node.title;
              }

              // This means a request for the latest fact-checks
              if (r.node.request_type === 'text' && r.node.content === '.') {
                return null;
              }

              return (
                <TableRow
                  key={r.node.id}
                  classes={{ root: classes.root }}
                  onClick={() => browserHistory.push(buildItemUrl(r.node.dbid))}
                >
                  <TitleCell
                    projectMedia={{
                      title: requestTitle,
                      description: '',
                      picture: r.node.media?.picture,
                    }}
                  />
                  <TableCell>
                    <FormattedDate
                      value={r.node.last_submitted_at || '-'}
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
                        <Box className={classes.hasFactCheck}>
                          {r.node.fact_checked_by.split(', ').map(teamName => (<span key={teamName}>{teamName}<br /></span>))}
                        </Box> :
                        <Box className={classes.noFactCheck}>
                          <FormattedMessage
                            id="feedRequestsTable.noFactCheck"
                            defaultMessage="No fact-check"
                            description="Displayed on feed requests table when a request was not fact-checked yet."
                          />
                        </Box>
                    }
                  </TableCell>
                  <TableCell align="left">{r.node.medias_count}</TableCell>
                </TableRow>
              );
            }) }
          </TableBody>
        </Table>
      </TableContainerWithScrollbars>
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
    const params = { ...newFilters, page: 1 };
    browserHistory.push(`/${teamSlug}/feed/${feedId}/requests/${JSON.stringify(params)}`);
  };

  return (
    <ErrorBoundary component="FeedRequestsTable">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedRequestsTableQuery($teamSlug: String!, $feedId: Int!, $offset: Int!, $pageSize: Int!, $sort: String, $sortType: String, $mediasCountMin: Int, $mediasCountMax: Int
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
          factCheckedBy: filters.feed_fact_checked_by,
          keyword: filters.keyword,
        }}
        render={({ props, error }) => {
          if (!error && !props) {
            return <MediasLoading />;
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
};

FeedRequestsTableQuery.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedId: PropTypes.number.isRequired,
  tabs: PropTypes.func.isRequired,
  searchUrlPrefix: PropTypes.string.isRequired,
  filters: PropTypes.object,
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requests_filters: PropTypes.object,
  }).isRequired,
};

export default FeedRequestsTableQuery;
