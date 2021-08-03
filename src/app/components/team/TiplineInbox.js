import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ForumIcon from '@material-ui/icons/Forum';
import { safelyParseJSON } from '../../helpers';
import Search from '../search/Search';
import CheckChannels from '../../CheckChannels';

export default function TiplineInbox({ routeParams }) {
  const query = {
    ...safelyParseJSON(routeParams.query, {}),
    channels: [CheckChannels.ANYTIPLINE],
    parent: {
      type: 'team',
      slug: routeParams.team,
    },
  };

  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/tipline-inbox`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="tiplineInbox.title" defaultMessage="Tipline inbox" />}
      icon={<ForumIcon />}
      teamSlug={routeParams.team}
      query={query}
      page="tipline-inbox"
    />
  );
}
TiplineInbox.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
