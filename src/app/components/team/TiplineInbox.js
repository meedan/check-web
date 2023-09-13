import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';
import InboxIcon from '../../icons/inbox.svg';

const defaultQuery = {
  channels: [CheckChannels.ANYTIPLINE],
  verification_status: [], // To be set to the value returned by the backend
};

const TiplineInbox = ({ routeParams }) => (
  <ErrorBoundary component="TiplineInbox">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TiplineInboxQuery($slug: String!) {
          team(slug: $slug) {
            verification_statuses
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
          defaultQuery.verification_status = [defaultStatusId];
          const query = {
            ...defaultQuery,
            ...safelyParseJSON(routeParams.query, {}),
          };
          return (
            <Search
              searchUrlPrefix={`/${routeParams.team}/tipline-inbox`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              title={<FormattedMessage id="tiplineInbox.title" defaultMessage="Tipline inbox" description="Title for the tipline inbox listing of items" />}
              icon={<InboxIcon />}
              teamSlug={routeParams.team}
              query={query}
              defaultQuery={defaultQuery}
              hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
              readOnlyFields={['verification_status']}
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

export { defaultQuery as tiplineInboxDefaultQuery };
export default TiplineInbox;
