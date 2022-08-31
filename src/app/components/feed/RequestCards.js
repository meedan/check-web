import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RequestCard from './RequestCard';

const RequestCards = ({ request }) => (
  <div className="request-cards">
    <strong>
      <FormattedMessage
        id="feedRequestedMedia.numberOfMedias"
        defaultMessage="{requestsCount, plural, one {# request across all medias} other {# requests across all medias}}"
        description="Header of requests list. Example: 26 requests across all medias"
        values={{ requestsCount: request.requests_count }}
      />
    </strong>
    <RequestCard
      text={request.content}
      details={[
        'Fulano',
        request.last_submitted_at,
        'English',
        'TSE Feed',
      ]}
    />
    { request.similar_requests?.edges.map(r => (
      <RequestCard
        key={r.node.dbid}
        text={r.node.content}
        details={[
          'Fulano',
          r.node.last_submitted_at,
          'English',
          'TSE Feed',
        ]}
      />
    )) }
  </div>
);

RequestCards.propTypes = {
  request: PropTypes.object.isRequired,
};

export default createFragmentContainer(RequestCards, graphql`
  fragment RequestCards_request on Request {
    content
    last_submitted_at
    requests_count
    similar_requests(first: 50) {
      edges {
        node {
          dbid
          content
          last_submitted_at
        }
      }
    }
  }
`);
