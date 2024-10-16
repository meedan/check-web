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
  sort: 'recent_activity',
  sort_type: 'DESC',
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
              defaultQuery={defaultQuery}
              hideFields={['feed_fact_checked_by', 'cluster_teams', 'cluster_published_reports']}
              icon={<InboxIcon />}
              listSubtitle={<FormattedMessage defaultMessage="Media Clusters List" description="Displayed on top of the tipline lists title on the search results page." id="search.tiplineSubHeader" />}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              page="tipline-inbox"
              query={query}
              readOnlyFields={['verification_status']}
              searchUrlPrefix={`/${routeParams.team}/tipline-inbox`}
              teamSlug={routeParams.team}
              title={<FormattedMessage defaultMessage="Inbox" description="Title for the tipline inbox listing of items" id="tiplineInbox.title" />}
            />
          );
        }
        return null;
      }}
      variables={{
        slug: routeParams.team,
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
