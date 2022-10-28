/* eslint-disable @calm/react-intl/missing-attribute, relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ForumIcon from '@material-ui/icons/Forum';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';

const TiplineInbox = ({ routeParams }) => (
  <ErrorBoundary component="TiplineInbox">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TiplineInboxQuery($slug: String!) {
          team(slug: $slug) {
            id
            verification_statuses
            get_tipline_inbox_filters
          }
        }
      `}
      variables={{
        slug: routeParams.team,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const { team } = props;
          const defaultStatusId = team.verification_statuses.default;
          const savedQuery = team.get_tipline_inbox_filters || {};
          let query = {};
          if (typeof routeParams.query === 'undefined' && Object.keys(savedQuery).length > 0) {
            query = { ...savedQuery };
          } else {
            query = typeof routeParams.query === 'undefined' ?
              {
                read: ['0'],
                projects: ['-1'],
                verification_status: [defaultStatusId],
                ...safelyParseJSON(routeParams.query, {}),
              } :
              {
                ...safelyParseJSON(routeParams.query, {}),
              };
          }
          query.channels = [CheckChannels.ANYTIPLINE];
          return (
            <Search
              searchUrlPrefix={`/${routeParams.team}/tipline-inbox`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              title={<FormattedMessage id="tiplineInbox.title" defaultMessage="Tipline inbox" />}
              icon={<ForumIcon />}
              teamSlug={routeParams.team}
              query={query}
              hideFields={['feed_fact_checked_by', 'channels', 'cluster_teams', 'cluster_published_reports']}
              page="tipline-inbox"
            />
          );
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

TiplineInbox.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default TiplineInbox;
