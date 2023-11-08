import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import TiplineRequest from '../annotations/TiplineRequest';
import styles from './media.module.css';

class MediaRequestsComponent extends Component {
  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaRequests', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-requests-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  render() {
    const { media } = this.props;

    return (
      <div id="media__requests" className={cx(styles['media-requests'], styles['media-item-content'])}>
        { (!this.props.all && media.requests_count > 0) && (
          <span className="typography-subtitle2">
            <FormattedMessage
              id="mediaRequests.thisRequests"
              defaultMessage="{count, plural, one {# request} other {# requests}}"
              description="The count in a readable sentence of the number of requests for this media"
              values={{
                count: media.requests_count,
              }}
            />
          </span>
        )}
        <Annotations
          noLink
          component={TiplineRequest}
          annotations={media.requests?.edges}
          annotated={media}
          annotatedType="ProjectMedia"
          annotationsCount={this.props.all ? media.demand : media.requests_count}
          relay={this.props.relay}
          noActivityMessage={
            <FormattedMessage
              id="mediaRequests.noRequest"
              defaultMessage="0 Requests"
              description="Empty message when there are zero requests for this item"
            />
          }
        />
      </div>
    );
  }
}

MediaRequestsComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const pageSize = 10;

const MediaAllRequestsContainer = Relay.createContainer(withPusher(MediaRequestsComponent), {
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
        requests(last: $pageSize) {
          edges {
            node {
              id
              dbid
              created_at
              value_json
              annotation_id
              associated_graphql_id
              smooch_user_slack_channel_url
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

const MediaOwnRequestsContainer = Relay.createContainer(withPusher(MediaRequestsComponent), {
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
        requests(last: $pageSize) {
          edges {
            node {
              id
              dbid
              created_at
              value_json
              annotation_id
              associated_graphql_id
              smooch_user_slack_channel_url
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
  const projectId = props.media.project_id;
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });
  const { media, style, all } = props;

  const Container = all ? MediaAllRequestsContainer : MediaOwnRequestsContainer;

  return (
    <Relay.RootContainer
      Component={Container}
      renderFetched={data =>
        <Container cachedMedia={media} style={style} all={all} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading theme="grey" variant="inline" size="medium" />}
      forceFetch
    />
  );
};

export default MediaRequests;
