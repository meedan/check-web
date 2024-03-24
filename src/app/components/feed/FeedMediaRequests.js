/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import Annotations from '../annotations/Annotations';
import TiplineRequest from '../annotations/TiplineRequest';
import NotFound from '../NotFound';
import styles from '../media/media.module.css';

const FeedMediaRequestsComponent = ({ item }) => {
  const requests = item.requests?.edges || [];

  return (
    <div id="media__requests" className={cx(styles['media-requests'], styles['media-item-content'])}>
      { item.requests_count > 0 && (
        <span className="typography-subtitle2">
          <FormattedMessage
            id="feedMediaRequests.counter"
            defaultMessage="{count, plural, one {# request} other {# requests}}"
            description="The count in a readable sentence of the number of requests for this media in the feed."
            values={{
              count: item.requests_count,
            }}
          />
        </span>
      )}
      <Annotations
        noLink
        component={TiplineRequest}
        componentProps={{ showButtons: false }}
        annotations={requests}
        annotated={{ ...item, archived: 1 }}
        annotatedType="ProjectMedia"
        annotationsCount={requests.length}
        noActivityMessage={
          <FormattedMessage
            id="feedMediaRequests.noRequest"
            defaultMessage="0 Requests"
            description="Empty message when there are zero requests for this item in the feed"
          />
        }
      />
    </div>
  );
};

const FeedMediaRequests = ({ itemDbid }) => {
  const { currentTeamSlug, feedDbid, projectMediaDbid } = window.location.pathname.match(/^\/(?<currentTeamSlug>[^/]+)\/feed\/(?<feedDbid>[0-9]+)\/item\/(?<projectMediaDbid>[0-9]+)$/).groups;

  return (
    <ErrorBoundary component="FeedMediaRequests">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedMediaRequestsQuery($currentTeamSlug: String!, $feedDbid: Int!, $projectMediaDbid: Int!, $itemDbid: Int!) {
            team(slug: $currentTeamSlug) {
              feed(dbid: $feedDbid) {
                cluster(project_media_id: $projectMediaDbid) {
                  project_media(id: $itemDbid) {
                    id
                    dbid
                    requests_count
                    media {
                      file_path
                    }
                    requests(last: 100) {
                      edges {
                        node {
                          id
                          dbid
                          associated_id
                          associated_graphql_id
                          created_at
                          smooch_data
                          smooch_user_request_language
                          smooch_user_external_identifier
                          smooch_report_sent_at
                          smooch_report_received_at
                          smooch_report_correction_sent_at
                          smooch_report_update_received_at
                          smooch_request_type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        variables={{
          currentTeamSlug,
          feedDbid: parseInt(feedDbid, 10),
          projectMediaDbid: parseInt(projectMediaDbid, 10),
          itemDbid: parseInt(itemDbid, 10),
        }}
        render={({ props, error }) => {
          if (props && !error) {
            const item = props.team?.feed?.cluster?.project_media;
            if (item) {
              return (<FeedMediaRequestsComponent item={item} />);
            }
            return (<NotFound />);
          }
          return <MediasLoading theme="grey" variant="inline" size="large" />;
        }}
      />
    </ErrorBoundary>
  );
};

FeedMediaRequests.propTypes = {
  itemDbid: PropTypes.number.isRequired,
};

export default FeedMediaRequests;
