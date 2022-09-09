import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { Box, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import RequestCard from './RequestCard';
import MediasLoading from '../media/MediasLoading';
import ErrorBoundary from '../error/ErrorBoundary';
import { whatsappGreen } from '../../styles/js/shared';

const useStyles = makeStyles({
  requestsHeader: {
    height: '48px',
    fontWeight: 700,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
  },
});

const RequestCards = ({ request, mediaDbid }) => {
  const isAllMedias = !mediaDbid;
  const isParentRequest = request.media.dbid === mediaDbid;
  const classes = useStyles();

  let requestsCount = request.similar_requests?.edges.length;
  if (isAllMedias || isParentRequest) { requestsCount += 1; }

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
              <FormattedMessage
                id="feedRequestedMedia.requestsForAllMedias"
                defaultMessage="{requestsCount, plural, one {# request across all medias} other {# requests across all medias}}"
                description="Header of requests list. Example: 26 requests across all medias"
                values={{ requestsCount }}
              />
            ) : (
              <FormattedMessage
                id="feedRequestedMedia.requestsForThisMedia"
                defaultMessage="{requestsCount, plural, one {# request for this media} other {# requests for this media}}"
                description="Header of requests list. Example: 3 requests for this media"
                values={{ requestsCount }}
              />
            )
          }
        </div>
      </Box>
      { isAllMedias || isParentRequest ?
        <RequestCard
          icon={whatsappIcon}
          text={request.content}
          details={[
            (<FormattedDate
              value={request.last_submitted_at}
              year="numeric"
              month="short"
              day="2-digit"
            />),
            feedChip,
          ]}
        />
        : null
      }
      { request.similar_requests?.edges.map(r => (
        <RequestCard
          key={r.node.dbid}
          icon={whatsappIcon}
          text={r.node.content}
          details={[
            (<FormattedDate
              value={r.node.last_submitted_at}
              year="numeric"
              month="short"
              day="2-digit"
            />),
            feedChip,
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
            content
            feed {
              name
            }
            last_submitted_at
            media {
              dbid
            }
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
