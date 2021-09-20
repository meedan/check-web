import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ForumIcon from '@material-ui/icons/Forum';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';

const TiplineInbox = ({ routeParams }) => (
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
        const defaultStatusId = props.team.verification_statuses.default;
        const query = {
          read: ['0'],
          projects: ['-1'],
          verification_status: [defaultStatusId],
          ...safelyParseJSON(routeParams.query, {}),
          channels: [CheckChannels.ANYTIPLINE],
        };

        return (
          <Search
            searchUrlPrefix={`/${routeParams.team}/tipline-inbox`}
            mediaUrlPrefix={`/${routeParams.team}/media`}
            title={<FormattedMessage id="tiplineInbox.title" defaultMessage="Tipline inbox" />}
            icon={<ForumIcon />}
            teamSlug={routeParams.team}
            query={query}
            hideFields={['channels']}
            page="tipline-inbox"
          />
        );
      }
      return null;
    }}
  />
);

TiplineInbox.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default TiplineInbox;
