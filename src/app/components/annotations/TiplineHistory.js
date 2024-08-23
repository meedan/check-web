/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import PaginatedTiplineHistory from './PaginatedTiplineHistory';

const TiplineHistory = ({
  handleClose,
  teamSlug,
  title,
  uid,
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
    render={({ error, props: innerProps }) => {
      if (!error && innerProps) {
        const { team } = innerProps;

        return (
          <PaginatedTiplineHistory
            handleClose={handleClose}
            pageSize={pageSize}
            parentProps={innerProps}
            root={team}
            title={title}
          />
        );
      }
      return null;
    }}
    variables={{
      teamSlug,
      uid,
      pageSize,
    }}
  />);
};

TiplineHistory.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default TiplineHistory;

