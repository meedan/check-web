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
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import ListHeader from '../layout/ListHeader';
import TitleCell from '../search/SearchResultsTable/TitleCell';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
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
  tableHeadCell: {
    whiteSpace: 'nowrap',
  },
});

const FeedRequestsTable = ({
  tabs,
  feed,
  searchUrlPrefix,
  sort,
  sortType,
  onChangeSort,
  onChangeSortType,
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
    return `/check/feed/${feed.dbid}/request/${requestDbid}?${urlParams.toString()}`;
  };

  const classes = useStyles();

  const mediaType = requestType => ({
    text: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeText"
        defaultMessage="Text"
        description="Label for feed request media type"
      />
    ),
    image: (
      <FormattedMessage
        id="feedRequestsTable.mediaTypeImage"
        defaultMessage="Image"
        description="Label for feed request media type"
      />
    ),
    video: (
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

  return (
    <React.Fragment>
      <Box mb={2}>
        <ListHeader listName={feed.name} icon={<DynamicFeedIcon />} />
        { tabs({}) }
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton onClick={onGoToThePreviousPage} disabled={!hasPreviousPage}>
          <PrevIcon />
        </IconButton>
        <Box className={classes.pager}>{rangeStart} - {rangeEnd > feed.root_requests_count ? feed.root_requests_count : rangeEnd} / {feed.root_requests_count}</Box>
        <IconButton onClick={onGoToTheNextPage} disabled={!hasNextPage}>
          <NextIcon />
        </IconButton>
      </Box>
      <TableContainer>
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
                <FormattedMessage
                  id="feedRequestsTable.factCheckBy"
                  defaultMessage="Fact-check by"
                  description="Header label for fact-check by column"
                />
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
                  <TableCell align="left">{mediaType(r.node.request_type)}</TableCell>
                  <TableCell align="left">{r.node.requests_count}</TableCell>
                  <TableCell align="left">{r.node.subscriptions_count}</TableCell>
                  <TableCell align="left">
                    {
                      r.node.fact_checked_by ?
                        r.node.fact_checked_by.split(', ').map(teamName => (<span>{teamName}<br /></span>)) :
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
      </TableContainer>
    </React.Fragment>
  );
};

FeedRequestsTable.propTypes = {};

const FeedRequestsTableQuery = ({
  teamSlug,
  feedId,
  tabs,
  searchUrlPrefix,
}) => {
  const pageSize = 50;
  const [sort, setSort] = React.useState('last_submitted');
  const [sortType, setSortType] = React.useState('desc');

  // FIXME: Implement a better pagination method (e.g., properly Relay). I tried to implement using pageInfo and cursors but it was not working correctly.
  const [page, setPage] = React.useState(1);

  return (
    <ErrorBoundary component="FeedRequestsTable">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedRequestsTableQuery($teamSlug: String!, $feedId: Int!, $offset: Int!, $pageSize: Int!, $sort: String, $sortType: String) {
            team(slug: $teamSlug) {
              feed(dbid: $feedId) {
                dbid
                name
                root_requests_count
                requests(first: $pageSize, offset: $offset, sort: $sort, sort_type: $sortType) {
                  edges {
                    node {
                      id
                      dbid
                      content
                      last_submitted_at
                      requests_count
                      medias_count
                      subscriptions_count
                      fact_checked_by
                      title
                      request_type
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
                searchUrlPrefix={searchUrlPrefix}
                sort={sort}
                sortType={sortType}
                onChangeSort={(value) => { setSort(value); }}
                onChangeSortType={(value) => { setSortType(value); }}
                onGoToTheNextPage={() => { setPage(page + 1); }}
                onGoToThePreviousPage={() => { setPage(page - 1); }}
                rangeStart={((page - 1) * pageSize) + 1}
                rangeEnd={((page - 1) * pageSize) + pageSize}
                hasNextPage={(page * pageSize) < props.team?.feed?.root_requests_count}
                hasPreviousPage={page > 1}
              />);
          }
          return null;
        }}
      />
    </ErrorBoundary>
  );
};

FeedRequestsTableQuery.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedId: PropTypes.number.isRequired,
  tabs: PropTypes.func.isRequired,
  searchUrlPrefix: PropTypes.string.isRequired,
};

export default FeedRequestsTableQuery;
