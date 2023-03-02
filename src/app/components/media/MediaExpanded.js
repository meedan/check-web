import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
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
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import { units, textSecondary } from '../../styles/js/shared';

const TypographyBlack54 = withStyles({
  root: {
    color: textSecondary,
  },
})(Typography);

class MediaExpandedComponent extends Component {
  componentDidUpdate() {
    this.setContext();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setContext() {
    const context = new CheckContext(this);
    const { team, project } = this.props.media;
    context.setContextStore({ team, project });
  }

  render() {
    const { media, hideActions } = this.props;
    const { playbackRate } = this.state;

    const currentTeam = this.getContext().team || this.getContext().currentUser.current_team;

    const currentUserRole = UserUtil.myRole(
      this.getContext().currentUser,
      currentTeam.slug,
    );

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
    const coverImage = media.media.thumbnail_path || '/images/player_cover.svg';

    let warningType = null;
    if (media.dynamic_annotation_flag) {
      // Sort by flag category likelihood and display most likely
      let sortable = [];
      // Put custom flag at beginning of array
      if (media.dynamic_annotation_flag.data.custom) {
        sortable = sortable.concat([...Object.entries(media.dynamic_annotation_flag.data.custom)]);
      }
      const filteredFlags = {};
      ['adult', 'medical', 'violence'].forEach((key) => { filteredFlags[key] = media.dynamic_annotation_flag.data.flags[key]; });
      sortable = sortable.concat([...Object.entries(filteredFlags)]);
      sortable.sort((a, b) => b[1] - a[1]);
      const type = sortable[0];
      [warningType] = type;
    }

    const embedCard = (() => {
      if (isImage) {
        return (
          <ImageMediaCard
            key={media.dynamic_annotation_flag}
            contentWarning={media.show_warning_cover}
            warningCreator={media.dynamic_annotation_flag?.annotator?.name}
            warningCategory={warningType}
            imagePath={media.media.embed_path}
          />
        );
      } else if (isMedia || isYoutube) {
        return (
          <MediaPlayerCard
            key={media.dynamic_annotation_flag}
            isYoutube={isYoutube}
            filePath={filePath}
            coverImage={coverImage}
            contentWarning={media.show_warning_cover}
            warningCreator={media.dynamic_annotation_flag?.annotator?.name}
            warningCategory={warningType}
          />
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
            key={media.dynamic_annotation_flag}
            contentWarning={media.show_warning_cover}
            warningCreator={media.dynamic_annotation_flag?.annotator?.name}
            warningCategory={warningType}
            media={media}
            data={data}
          />
        );
      } else if (isPender) {
        return (
          <PenderCard
            url={media.media.url}
            fallback={null}
            domId={`pender-card-${randomNumber}`}
            mediaVersion={data.refreshes_count}
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

    let description = media.extracted_text ? media.extracted_text.data.text : media.media.metadata.description;
    description = media.transcription && media.transcription.data.text ? media.transcription.data.text : description;

    return (
      <React.Fragment>
        <CardContent style={{ padding: `0 ${units(2)}` }}>
          <MediaExpandedSecondRow projectMedia={media} />
          { isImage ?
            <Box mb={2}>
              <TypographyBlack54 variant="body2" color={textSecondary}>
                { media.extracted_text ?
                  <FormattedMessage id="mediaExpanded.extractedText" defaultMessage="Text extracted from image:" description="Label for text extracted from the image below" /> :
                  <FormattedMessage id="mediaExpanded.noExtractedText" defaultMessage="No text extracted from this image" description="Label when text extracted from an image is not available" />
                }
              </TypographyBlack54>
            </Box> : null
          }
          { isMedia ?
            <Box mb={2}>
              <TypographyBlack54 variant="body2" color={textSecondary}>
                { media.transcription && media.transcription.data.last_response.job_status === 'COMPLETED' ?
                  <FormattedMessage id="mediaExpanded.transcriptionCompleted" defaultMessage="Audio transcribed from media:" description="Label for transcription from audio or video" /> : null }
                { media.transcription && media.transcription.data.last_response.job_status === 'IN_PROGRESS' ?
                  <FormattedMessage id="mediaExpanded.transcriptionInProgress" defaultMessage="Audio transcription in progress…" description="Label when transcription is in progress" /> : null }
                { !media.transcription ?
                  <FormattedMessage id="mediaExpanded.noTranscription" defaultMessage="No audio transcribed from this media" description="Label when transcription is not (yet) available" /> : null }
              </TypographyBlack54>
            </Box> : null
          }
          <Box mb={2}>
            <MoreLess>
              <Typography variant="body2">
                <ParsedText text={description} />
              </Typography>
            </MoreLess>
          </Box>
          <MediaExpandedUrl url={media.media.url} />
          <MediaExpandedArchives projectMedia={media} />
          <MediaExpandedMetadata projectMedia={media} />
          {embedCard}
        </CardContent>
        {
          hideActions ? null : (
            <CardActions>
              <MediaExpandedActions
                currentUserRole={currentUserRole}
                projectMedia={media}
                playbackRate={playbackRate}
                onPlaybackRateChange={r => this.setState({ playbackRate: r })}
              />
            </CardActions>
          )
        }
      </React.Fragment>
    );
  }
}

MediaExpandedComponent.contextTypes = {
  store: PropTypes.object,
};

MediaExpandedComponent.propTypes = {
  /*
    FIXME refactor MediaExpanded component and children.
    Make children fragmentContainer and simplify parent query.
    Define actual propTypes shape of media for MediaExpanded.
  */
  media: PropTypes.object.isRequired,
};

const MediaExpandedContainer = Relay.createContainer(MediaExpandedComponent, {
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
        extracted_text: annotation(annotation_type: "extracted_text") {
          data
        }
        transcription: annotation(annotation_type: "transcription") {
          data
        }
        project_id
        pusher_channel
        full_url
        dynamic_annotation_language {
          id
        }
        last_status_obj {
          data
        }
        show_warning_cover
        dynamic_annotation_flag {
          id
          dbid
          content
          data
          annotator {
            name
          }
        }
        ${MediaExpandedActions.getFragment('projectMedia')}
        ${MediaExpandedArchives.getFragment('projectMedia')}
        ${MediaExpandedMetadata.getFragment('projectMedia')}
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
          permissions
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          }
        }
      }
    `,
  },
});

const MediaExpanded = (props) => {
  const projectId = props.media.project_id;
  let ids = `${props.media.dbid},${projectId}`;
  if (props.media.team && props.media.team.dbid) {
    ids = `${props.media.dbid},${projectId},${props.media.team.dbid}`;
  }
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaExpandedContainer}
      renderLoading={() => <MediasLoading count={1} />}
      renderFetched={data => <MediaExpandedContainer {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaExpanded;
export { MediaExpandedComponent };
