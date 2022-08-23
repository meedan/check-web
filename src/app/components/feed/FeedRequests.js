import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@material-ui/core';

const rows = [
  {
    thumbnail: '',
    title: '',
    last_submitted: new Date().toISOString(),
    requests_count: 10,
    matched_media_count: 10,
  },
  {
    thumbnail: '',
    title: '',
    last_submitted: new Date().toISOString(),
    requests_count: 10,
    matched_media_count: 10,
  },
  {
    thumbnail: '',
    title: '',
    last_submitted: new Date().toISOString(),
    requests_count: 10,
    matched_media_count: 10,
  },
];

const FeedRequests = ({ tabs }) => (
  <React.Fragment>
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
          {rows.map(row => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">{row.last_submitted}</TableCell>
              <TableCell align="right">{row.requests_count}</TableCell>
              <TableCell align="right">{row.matched_media_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </React.Fragment>
);

export default FeedRequests;
