import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RequestCard from './RequestCard';
import ErrorBoundary from '../error/ErrorBoundary';

const RequestCards = ({ request }) => (
  <div className="request-cards">
    <strong>
      <FormattedMessage
        id="feedRequestedMedia.numberOfMedias"
        defaultMessage="{requestsCount, plural, one {# request across all medias} other {# requests across all medias}}"
        description="Header of requests list. Example: 26 requests across all medias"
        values={{ requestsCount: request.requests_count || request.similar_requests?.edges.length }}
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
        details={[r.node.last_submitted_at]}
      />
    )) }
  </div>
);

RequestCards.propTypes = {
  request: PropTypes.object.isRequired,
};

const RequestCardsQuery = ({ requestDbid, mediaDbid }) => (
  <ErrorBoundary component="RequestCards">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query RequestCardsQuery($requestId: ID!, $mediaId: Int!) {
          request(id: $requestId) {
            content
            last_submitted_at
            requests_count
            similar_requests(first: 50, media_id: $mediaId) {
              edges {
                node {
                  dbid
                  content
                  last_submitted_at
                }
              }
            }
          }
        }
      `}
      variables={{
        requestId: requestDbid,
        mediaId: mediaDbid,
      }}
      render={({ props, error }) => {
        if (props && !error) {
          return (<RequestCards request={props.request} mediaDbid={mediaDbid} />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

export default RequestCardsQuery;
