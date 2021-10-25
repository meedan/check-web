import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { withStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Annotations from '../annotations/Annotations';
import Comment from '../annotations/Comment';
import ProfileLink from '../layout/ProfileLink';
import UserTooltip from '../user/UserTooltip';

class MediaCommentsComponent extends Component {
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
    const {
      pusher,
      clientSessionId,
      media,
      relay,
    } = this.props;
    if (pusher) {
      pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComments', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
          if (run) {
            relay.forceFetch();
            return true;
          }
          return {
            id: `media-comments-${media.dbid}`,
            callback: relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    if (pusher) {
      pusher.unsubscribe(media.pusher_channel);
    }
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const { classes } = this.props;

    return (
      <div id="media__comments" className={classes.root}>
        <Annotations
          component={Comment}
          showAddAnnotation
          annotations={media.comments.edges}
          annotated={media}
          annotatedType="ProjectMedia"
          annotationsCount={media.annotations_count}
          relay={this.props.relay}
          onTimelineCommentOpen={this.props.onTimelineCommentOpen}
          noActivityMessage={
            <FormattedMessage
              id="mediaComments.noNote"
              defaultMessage="No note"
            />
          }
        />
      </div>
    );
  }
}

MediaCommentsComponent.propTypes = {
  clientSessionId: PropTypes.string.isRequired,
  pusher: pusherShape.isRequired,
};

const pageSize = 10;

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
  },
});

const MediaCommentsContainer = Relay.createContainer(withStyles(styles)(withPusher(MediaCommentsComponent)), {
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
        annotations_count(annotation_type: "comment")
        comments(last: $pageSize) {
          edges {
            node {
              id,
              dbid,
              content,
              text,
              annotation_type,
              updated_at,
              created_at,
              permissions,
              annotator {
                user {
                  id,
                  dbid,
                  name,
                  is_active,
                  team_user(team_slug: $teamSlug) {
                    ${ProfileLink.getFragment('teamUser')}, # FIXME: Make Annotation a container
                    ${UserTooltip.getFragment('teamUser')}, # FIXME: Make Annotation a container
                  },
                  source {
                    id,
                    dbid,
                    image,
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

const MediaComments = (props) => {
  const projectId = props.media.project_id;
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaCommentsContainer}
      renderFetched={data => (
        <MediaCommentsContainer
          cachedMedia={props.media}
          style={props.style}
          {...data}
          onTimelineCommentOpen={props.onTimelineCommentOpen}
        />)}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaComments;
