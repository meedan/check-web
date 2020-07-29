import React from 'react';
import Card from '@material-ui/core/Card';
import { withPusher, pusherShape } from '../../pusher';
import MediaExpanded from './MediaExpanded';
import MediaCondensed from './MediaCondensed';

class MediaDetail extends React.Component {
  componentDidMount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.unsubscribe();
    }
  }

  subscribe() {
    const { pusher, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaDetail', (data, run) => {
      if (this.props.parentComponentName === 'MediaRelated') {
        if (run) {
          this.props.parentComponent.props.relay.forceFetch();
          return true;
        }
        return {
          id: `parent-media-${this.props.parentComponent.props.media.dbid}`,
          callback: this.props.parentComponent.props.relay.forceFetch,
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
    const {
      annotated,
      annotatedType,
      end,
      gaps,
      media,
      onPlayerReady,
      onTimelineCommentOpen,
      onVideoAnnoToggle,
      playerRef,
      playing,
      scrubTo,
      seekTo,
      setPlayerState,
      showVideoAnnotation,
      start,
    } = this.props;

    // Build the item URL

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    let projectId = null;
    if (media.project_ids && media.project_ids.length > 0) {
      projectId = media.project_ids[media.project_ids.length - 1];
    }
    if (/project\/([0-9]+)/.test(path)) {
      projectId = path.match(/project\/([0-9]+)/).pop();
    }
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    let mediaUrl = projectId && media.team && media.dbid > 0
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;
    if (!mediaUrl && media.team && media.dbid > 0) {
      mediaUrl = `/${media.team.slug}/media/${media.dbid}`;
    }

    return (
      <Card className="card media-detail">
        {this.props.condensed ? (
          <MediaCondensed
            media={this.props.media}
            mediaUrl={mediaUrl}
            currentRelatedMedia={this.props.currentRelatedMedia}
          />
        ) : (
          <MediaExpanded
            media={this.props.media}
            mediaUrl={mediaUrl}
            {...{
              end,
              gaps,
              onPlayerReady,
              onTimelineCommentOpen,
              onVideoAnnoToggle,
              playerRef,
              playing,
              scrubTo,
              seekTo,
              setPlayerState,
              showVideoAnnotation,
              start,
            }}
          />
        )}
      </Card>
    );
  }
}

MediaDetail.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
};

export default withPusher(MediaDetail);
