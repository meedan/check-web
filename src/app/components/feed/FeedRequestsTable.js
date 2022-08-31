import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@material-ui/core';
import ErrorBoundary from '../error/ErrorBoundary';

const FeedRequestsTable = ({ tabs, feed }) => (
  <React.Fragment blo={feed.created_at}>
    { tabs({}) }
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Media</TableCell>
            <TableCell align="right">Last submitted</TableCell>
            <TableCell align="right">Requests</TableCell>
            <TableCell align="right">Matched media</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { feed?.requests?.edges.map((r) => {
            console.log('r', r); // eslint-disable-line
            return (
              <TableRow
                key={r.node.dbid}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={() => browserHistory.push(`/check/feed/${feed.dbid}/request/${r.node.dbid}`)}
              >
                <TableCell component="th" scope="row">
                  {r.node.content}
                </TableCell>
                <TableCell align="right">{r.node.last_submitted_at}</TableCell>
                <TableCell align="right">{r.node.requests_count}</TableCell>
                <TableCell align="right">{r.node.medias_count}</TableCell>
              </TableRow>
            );
          }) }
        </TableBody>
      </Table>
    </TableContainer>
  </React.Fragment>
);

const FeedRequestsTableQuery = ({ teamSlug, feedId, tabs }) => (
  <ErrorBoundary component="FeedRequestsTable">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedRequestsTableQuery($teamSlug: String!, $feedId: Int!) {
          team(slug: $teamSlug) {
            feed(dbid: $feedId) {
              dbid
              created_at
              requests(first: 50) {
                edges {
                  node {
                    dbid
                    content
                    last_submitted_at
                    requests_count
                    medias_count
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
        if (props && !error) {
          return (<FeedRequestsTable tabs={tabs} feed={props.team?.feed} />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

export default FeedRequestsTableQuery;
