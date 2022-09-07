import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@material-ui/core';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import { makeStyles } from '@material-ui/core/styles';
import ListHeader from '../layout/ListHeader';
import TitleCell from '../search/SearchResultsTable/TitleCell';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import { opaqueBlack03 } from '../../styles/js/shared';

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
});

const FeedRequestsTable = ({
  tabs,
  feed,
  searchUrlPrefix,
}) => {
  const buildItemUrl = (requestDbid) => {
    const urlParams = new URLSearchParams();
    urlParams.set('listPath', searchUrlPrefix);
    return `/check/feed/${feed.dbid}/request/${requestDbid}?${urlParams.toString()}`;
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      <Box mb={2}>
        <ListHeader listName={feed.name} icon={<DynamicFeedIcon />} />
        { tabs({}) }
      </Box>
      <TableContainer>
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
                <FormattedMessage
                  id="feedRequestsTable.lastSubmitted"
                  defaultMessage="Last submitted"
                  description="Header label for date column, in which are shown timestamps of last time a media was sent"
                />
              </TableCell>
              <TableCell>
                <FormattedMessage
                  id="feedRequestsTable.requests"
                  defaultMessage="Requests"
                  description="Header label for number of requests column"
                />
              </TableCell>
              <TableCell>
                <FormattedMessage
                  id="feedRequestsTable.matchedMedia"
                  defaultMessage="Matched media"
                  description="Header label for number of medias found to be matched to the current one"
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { feed?.requests?.edges.map(r => (
              <TableRow
                key={r.node.dbid}
                classes={classes}
                onClick={() => browserHistory.push(buildItemUrl(r.node.dbid))}
              >
                <TitleCell
                  projectMedia={{
                    title: r.node.media.quote || r.node.media.metadata?.title || r.node.content,
                    description: r.node.content,
                    picture: r.node.media.picture,
                  }}
                />
                <TableCell>
                  <FormattedDate
                    value={r.node.last_submitted_at}
                    year="numeric"
                    month="short"
                    day="2-digit"
                  />
                </TableCell>
                <TableCell align="right">{r.node.requests_count}</TableCell>
                <TableCell align="right">{r.node.medias_count}</TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

FeedRequestsTable.propTypes = {

};

const FeedRequestsTableQuery = ({
  teamSlug,
  feedId,
  tabs,
  searchUrlPrefix,
}) => (
  <ErrorBoundary component="FeedRequestsTable">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedRequestsTableQuery($teamSlug: String!, $feedId: Int!) {
          team(slug: $teamSlug) {
            feed(dbid: $feedId) {
              dbid
              name
              requests(first: 50) {
                edges {
                  node {
                    dbid
                    content
                    last_submitted_at
                    requests_count
                    medias_count
                    media {
                      quote
                      metadata
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
      }}
      render={({ props, error }) => {
        if (!error && !props) {
          return <MediasLoading />;
        }

        if (props && !error) {
          return (
            <FeedRequestsTable
              tabs={tabs}
              feed={props.team?.feed}
              searchUrlPrefix={searchUrlPrefix}
            />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

FeedRequestsTableQuery.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedId: PropTypes.number.isRequired,
  tabs: PropTypes.func.isRequired,
  searchUrlPrefix: PropTypes.string.isRequired,
};

export default FeedRequestsTableQuery;
