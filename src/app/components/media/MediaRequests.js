import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import merge from 'lodash.merge';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import TiplineRequest from '../annotations/TiplineRequest';

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
    const media = merge(this.props.cachedMedia, this.props.media);
    const { classes } = this.props;

    return (
      <div id="media__requests" className={classes.root}>
        <Typography variant="subtitle2">
          { this.props.all ?
            <FormattedMessage
              id="mediaRequests.allRequests"
              defaultMessage="{count, plural, one {# request across all media} other {# requests across all media}}"
              values={{
                count: this.props.media.demand,
              }}
            /> :
            <FormattedMessage
              id="mediaRequests.thisRequests"
              defaultMessage="{count, plural, one {# request} other {# requests}}"
              values={{
                count: this.props.media.requests_count,
              }}
            />
          }
        </Typography>
        <Annotations
          noLink
          component={TiplineRequest}
          annotations={media.requests.edges}
          annotated={media}
          annotatedType="ProjectMedia"
          annotationsCount={media.demand}
          relay={this.props.relay}
          noActivityMessage={
            <FormattedMessage
              id="mediaRequests.noRequest"
              defaultMessage="No requests"
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
const eventTypes = ['create_dynamicannotationfield'];
const fieldNames = ['smooch_data'];
const annotationTypes = [];
const whoDunnit = ['smooch'];

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
  },
});

const MediaAllRequestsContainer = Relay.createContainer(withStyles(styles)(withPusher(MediaRequestsComponent)), {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    whoDunnit,
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
        media {
          file_path
        }
        requests: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes, who_dunnit: $whoDunnit, include_related: true) {
          edges {
            node {
              id,
              dbid,
              item_type,
              item_id,
              event,
              event_type,
              created_at,
              object_after,
              object_changes_json,
              associated_graphql_id,
              smooch_user_slack_channel_url,
              smooch_user_request_language,
              smooch_user_external_identifier,
              smooch_report_received_at,
              smooch_report_update_received_at,
            }
          }
        }
      }
    `,
  },
});

const MediaOwnRequestsContainer = Relay.createContainer(withStyles(styles)(withPusher(MediaRequestsComponent)), {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    whoDunnit,
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
        requests_count
        media {
          file_path
        }
        requests: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes, who_dunnit: $whoDunnit, include_related: false) {
          edges {
            node {
              id,
              dbid,
              item_type,
              item_id,
              event,
              event_type,
              created_at,
              object_after,
              object_changes_json,
              associated_graphql_id,
              smooch_user_slack_channel_url,
              smooch_user_request_language,
              smooch_user_external_identifier,
              smooch_report_received_at,
              smooch_report_update_received_at,
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
      renderLoading={() => <MediasLoading count={1} />}
      forceFetch
    />
  );
};

export default MediaRequests;
