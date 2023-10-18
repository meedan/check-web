/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import PaginatedTiplineHistory from './PaginatedTiplineHistory';

const TiplineHistory = ({
  uid,
  teamSlug,
  handleClose,
  title,
}) => {
  const pageSize = 1000;

  return (<QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TiplineHistoryQuery($teamSlug: String!, $pageSize: Int!, $after: String, $uid: String!) {
        team(slug: $teamSlug) {
          id
          dbid
          ...PaginatedTiplineHistory_root
        }
      }
    `}
    variables={{
      teamSlug,
      uid,
      pageSize,
    }}
    render={({ error, props: innerProps }) => {
      if (!error && innerProps) {
        const { team } = innerProps;

        return (
          <PaginatedTiplineHistory
            root={team}
            pageSize={pageSize}
            parentProps={innerProps}
            handleClose={handleClose}
            title={title}
          />
        );
      }
      return null;
    }}
  />);
};

TiplineHistory.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default TiplineHistory;

