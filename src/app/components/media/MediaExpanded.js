import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import MediaRoute from '../../relay/MediaRoute';
import MediaExpandedActions from './MediaExpandedActions';
import MediaExpandedArchives from './MediaExpandedArchives';
import MediaExpandedMetadata from './MediaExpandedMetadata';
import MediaExpandedSecondRow from './MediaExpandedSecondRow';
import MediaExpandedUrl from './MediaExpandedUrl';
import MoreLess from '../layout/MoreLess';
import ParsedText from '../ParsedText';
import QuoteMediaCard from './QuoteMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import ImageMediaCard from './ImageMediaCard';
import MediaPlayerCard from './MediaPlayerCard';
import PenderCard from '../PenderCard';
import BlankMediaButton from './BlankMediaButton';
import { truncateLength, getCurrentProjectId } from '../../helpers';
import CheckContext from '../../CheckContext';
import { withPusher, pusherShape } from '../../pusher';
import { units } from '../../styles/js/shared';

class MediaExpandedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaVersion: false,
    };
  }

  componentDidMount() {
    this.setContext();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setContext();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setContext() {
    const context = new CheckContext(this);
    const { team, project } = this.props.media;
    context.setContextStore({ team, project });
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${media.dbid}`,
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
    const {
      media, playing, start, end, gaps, seekTo, scrubTo, setPlayerState, onPlayerReady,
    } = this.props;

    const {
      onTimelineCommentOpen,
      onVideoAnnoToggle,
      showVideoAnnotation,
    } = this.props;

    const data = typeof media.media.metadata === 'string' ? JSON.parse(media.media.metadata) : media.media.metadata;
    const isImage = media.media.type === 'UploadedImage';
    const isMedia = ['UploadedVideo', 'UploadedAudio'].indexOf(media.media.type) > -1;
    const isYoutube = media.media.url && media.domain === 'youtube.com';
    let filePath = media.media.file_path;
    if (isYoutube) {
      filePath = media.media.url;
    }
    const isQuote = media.media.type === 'Claim';
    const isBlank = media.media.type === 'Blank';
    const isWebPage = media.media.url && data.provider === 'page';
    const isPender = media.media.url && data.provider !== 'page';
    const randomNumber = Math.floor(Math.random() * 1000000);
    const { mediaUrl, mediaQuery } = this.props;
    const coverImage = media.media.thumbnail_path || '/images/player_cover.svg';

    const embedCard = (() => {
      if (isImage) {
        return <ImageMediaCard imagePath={media.media.embed_path} />;
      } else if (isMedia || isYoutube) {
        return (
          <div ref={this.props.playerRef}>
            <MediaPlayerCard
              filePath={filePath}
              coverImage={coverImage}
              {...{
                playing, start, end, gaps, scrubTo, seekTo, onPlayerReady, setPlayerState,
              }}
            />
          </div>
        );
      } else if (isQuote) {
        return (
          <QuoteMediaCard
            quote={media.media.quote}
            languageCode={media.language_code}
          />
        );
      } else if (isWebPage || !data.html) {
        return (
          <WebPageMediaCard
            media={media}
            mediaUrl={mediaUrl}
            mediaQuery={mediaQuery}
            data={data}
          />
        );
      } else if (isPender) {
        return (
          <PenderCard
            url={media.media.url}
            fallback={null}
            domId={`pender-card-${randomNumber}`}
            mediaVersion={this.state.mediaVersion || data.refreshes_count}
          />
        );
      }

      return null;
    })();

    if (isBlank) {
      return (
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: 400 }}
          >
            <BlankMediaButton
              projectMediaId={media.id}
              team={media.team}
            />
          </Box>
        </CardContent>
      );
    }

    const fileTitle = media.media.file_path ? media.media.file_path.split('/').pop().replace(/\..*$/, '') : null;
    const title = media.media.metadata.title || media.media.quote || fileTitle || media.title;
    const { description } = media.media.metadata;

    return (
      <React.Fragment>
        <CardHeader
          className="media-expanded__title"
          title={truncateLength(title, 110)}
        />
        <CardContent style={{ padding: `0 ${units(2)}` }}>
          <MediaExpandedSecondRow projectMedia={media} />
          <MoreLess>
            <Typography variant="body2">
              <ParsedText text={description} />
            </Typography>
          </MoreLess>
          <MediaExpandedUrl url={media.media.url} />
          <MediaExpandedArchives projectMedia={media} />
          <MediaExpandedMetadata projectMedia={media} />
          {embedCard}
        </CardContent>
        <CardActions>
          <MediaExpandedActions
            onTimelineCommentOpen={onTimelineCommentOpen}
            onVideoAnnoToggle={onVideoAnnoToggle}
            showVideoAnnotation={showVideoAnnotation}
            projectMedia={media}
          />
        </CardActions>
      </React.Fragment>
    );
  }
}

MediaExpandedComponent.contextTypes = {
  store: PropTypes.object,
};

MediaExpandedComponent.propTypes = {
  pusher: pusherShape.isRequired,
  playerRef: PropTypes.shape({ current: PropTypes.instanceOf(HTMLElement) }).isRequired,
  relay: PropTypes.object.isRequired,
  /*
    FIXME refactor MediaExpanded component and children.
    Make children fragmentContainer and simplify parent query.
    Define actual propTypes shape of media for MediaExpanded.
  */
  media: PropTypes.object.isRequired,
};

const MediaExpandedContainer = Relay.createContainer(withPusher(MediaExpandedComponent), {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        permissions
        domain
        created_at
        last_seen
        share_count
        requests_count
        picture
        title
        description
        language_code
        language
        project_ids
        pusher_channel
        dynamic_annotation_language {
          id
        }
        ${MediaExpandedActions.getFragment('projectMedia')}
        ${MediaExpandedArchives.getFragment('projectMedia')}
        ${MediaExpandedMetadata.getFragment('projectMedia')}
        relationships {
          id
          sources_count
          targets_count
          source_id
          target_id
        }
        relationship {
          id
          permissions
          source_id
          source {
            id
            dbid
            relationships {
              targets(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
          target_id
          target { id, dbid }
        }
        media {
          url
          type
          quote
          thumbnail_path
          file_path
          embed_path
          metadata
        }
        team {
          id
          dbid
          slug
          search_id
          verification_statuses
          get_languages
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
        }
      }
    `,
  },
});

const MediaExpanded = (props) => {
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaExpandedContainer}
      renderFetched={data => <MediaExpandedContainer {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaExpanded;
