import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { Box, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import Request from '../cds/requests-annotations/Request';
import RequestSubscription from './RequestSubscription';
import MediasLoading from '../media/MediasLoading';
import ErrorBoundary from '../error/ErrorBoundary';
import BulletSeparator from '../layout/BulletSeparator';
import { whatsappGreen } from '../../styles/js/shared';

const useStyles = makeStyles({
  requestsHeader: {
    height: '48px',
    fontWeight: 700,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
  },
  subscriptions: {
    color: '#E78A00',
  },
});

const RequestCards = ({ request, mediaDbid }) => {
  const isAllMedias = !mediaDbid;
  const isParentRequest = request.media.dbid === mediaDbid;
  const classes = useStyles();
  const requestsCount = request.requests_count;

  const whatsappIcon = (
    <WhatsAppIcon
      style={{
        backgroundColor: whatsappGreen,
        color: '#FFF',
        borderRadius: 4,
        padding: 2,
      }}
    />
  );

  const feedChip = <Chip label={request.feed.name} size="small" />;

  return (
    <div className="request-cards">
      <Box pl={1}>
        <div className={classes.requestsHeader}>
          {
            isAllMedias ? (
              <BulletSeparator
                icon={whatsappIcon}
                details={[
                  (<FormattedMessage
                    id="feedRequestedMedia.requestsForAllMedias"
                    defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                    description="Header of requests list. Example: 26 requests"
                    values={{ requestsCount }}
                  />),
                  (
                    <span className={classes.subscriptions}>
                      <FormattedMessage
                        id="feedRequestedMedia.subscriptionsForAllMedias"
                        defaultMessage="{subscriptionsCount, plural, one {# subscription} other {# subscriptions}}"
                        description="Part of the header of requests list. Example: 12 subscriptions"
                        values={{ subscriptionsCount: request.subscriptions_count }}
                      />
                    </span>
                  ),
                ]}
              />
            ) : (
              <FormattedMessage
                id="feedRequestedMedia.requestsForThisMedia"
                defaultMessage="{requestsCount, plural, one {# request for this media} other {# requests for this media}}"
                description="Header of requests list. Example: 3 requests for this media"
                values={{ requestsCount: request.similar_requests?.edges.length || 1 }}
              />
            )
          }
        </div>
      </Box>
      { isAllMedias || isParentRequest ?
        <Request
          icon={whatsappIcon}
          text={request.content}
          fileUrl={request.media?.file_path}
          mediaTitle={request.title}
          details={[
            `request-${request.dbid}`,
            (<FormattedDate
              value={request.last_submitted_at}
              year="numeric"
              month="short"
              day="2-digit"
            />),
            feedChip,
            ((request.subscribed || request.last_called_webhook_at) ?
              <RequestSubscription
                subscribed={request.subscribed}
                lastCalledAt={request.last_called_webhook_at}
              />
              : null
            ),
          ]}
        />
        : null
      }
      { request.similar_requests?.edges.map(r => (
        <Request
          key={r.node.dbid}
          icon={whatsappIcon}
          text={r.node.content}
          fileUrl={r.node.media?.file_path}
          mediaTitle={r.node.title}
          details={[
            `request-${r.node.dbid}`,
            (<FormattedDate
              value={r.node.last_submitted_at}
              year="numeric"
              month="short"
              day="2-digit"
            />),
            feedChip,
            ((r.node.subscribed || r.node.last_called_webhook_at) ?
              <RequestSubscription
                subscribed={r.node.subscribed}
                lastCalledAt={r.node.last_called_webhook_at}
              />
              : null
            ),
          ]}
        />
      )) }
    </div>
  );
};

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
            dbid
            content
            subscriptions_count
            subscribed
            requests_count
            last_called_webhook_at
            title
            feed {
              name
            }
            last_submitted_at
            media {
              dbid
              file_path
            }
            similar_requests(first: 100, media_id: $mediaId) {
              edges {
                node {
                  dbid
                  content
                  title
                  subscribed
                  last_submitted_at
                  last_called_webhook_at
                  media {
                    file_path
                  }
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
        if (!error && !props) {
          return <MediasLoading center />;
        }
        if (props && !error) {
          return (<RequestCards {...props} mediaDbid={mediaDbid} />);
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

export default RequestCardsQuery;
