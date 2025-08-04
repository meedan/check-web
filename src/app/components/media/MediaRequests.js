/* eslint-disable react/sort-prop-types */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import Loader from '../cds/loading/Loader';
import MediaRoute from '../../relay/MediaRoute';
import Annotations from '../annotations/Annotations';
import TiplineRequest from '../annotations/TiplineRequest';
import styles from './media.module.css';

class MediaRequestsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { media } = this.props;

    return (
      <div className={cx(styles['media-requests'], styles['media-item-content'])} id="media__requests">
        { (!this.props.all && media.requests_count > 0) && (
          <p className="typography-subtitle2">
            <FormattedMessage
              defaultMessage="{count, plural, one {# request} other {# requests}}"
              description="The count in a readable sentence of the number of requests for this media"
              id="mediaRequests.thisRequests"
              values={{
                count: media.requests_count,
              }}
            />
          </p>
        )}
        <Annotations
          annotated={media}
          annotatedType="ProjectMedia"
          annotations={media.requests?.edges}
          annotationsCount={this.props.all ? media.demand : media.requests_count}
          component={TiplineRequest}
          noActivityMessage={
            <FormattedMessage
              defaultMessage="0 Requests"
              description="Empty message when there are zero requests for this item"
              id="mediaRequests.noRequest"
            />
          }
          noLink
          relay={this.props.relay}
        />
      </div>
    );
  }
}

const pageSize = 10;

const MediaAllRequestsContainer = Relay.createContainer(MediaRequestsComponent, {
  initialVariables: {
    pageSize,
    teamSlug: null,
  },
  prepareVariables: vars => ({
    ...vars,
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  }),
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        pusher_channel
        demand
        requests_count
        media {
          file_path
        }
        requests(last: $pageSize, includeChildren: true) {
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
    `,
  },
});

const MediaOwnRequestsContainer = Relay.createContainer(MediaRequestsComponent, {
  initialVariables: {
    pageSize,
    teamSlug: null,
  },
  prepareVariables: vars => ({
    ...vars,
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  }),
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        pusher_channel
        demand
        requests_count
        media {
          file_path
        }
        requests(last: $pageSize, includeChildren: false) {
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
    `,
  },
});

const MediaRequests = (props) => {
  const route = new MediaRoute({ ids: `${props.media.dbid}` });
  const { all, media, style } = props;

  const Container = all ? MediaAllRequestsContainer : MediaOwnRequestsContainer;

  return (
    <Relay.RootContainer
      Component={Container}
      forceFetch
      renderFetched={data =>
        <Container all={all} cachedMedia={media} style={style} {...data} />}
      renderLoading={() => <Loader size="medium" theme="grey" variant="inline" />}
      route={route}
    />
  );
};

export default MediaRequests;
