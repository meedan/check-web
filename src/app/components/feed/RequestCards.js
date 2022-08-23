import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RequestCard from './RequestCard';

const requests = [
  { text: 'This is a request' },
  { text: 'This is a request' },
  { text: 'This is a request' },
  { text: 'This is a request' },
  { text: 'This is a request' },
];

const RequestCards = () => (
  <div className="request-cards">
    <strong>
      <FormattedMessage
        id="feedRequestedMedia.numberOfMedias"
        defaultMessage="{requestsCount, plural, one {# request across all medias} other {# requests across all medias}}"
        description="Header of requests list. Example: 26 requests across all medias"
        values={{ requestsCount: requests.length }}
      />
    </strong>
    { requests.map(r => (
      <RequestCard
        text={r.text}
        details={[
          'Fulano',
          '9 hours ago',
          'English',
          'TSE Feed',
        ]}
      />
    )) }
  </div>
);

RequestCard.propTypes = {
  requests: PropTypes.array.isRequired,
};

export default RequestCards;
