import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import MediaCardLargeActions from './MediaCardLargeActions';
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
import CheckContext from '../../CheckContext';
import { units } from '../../styles/js/shared';

const TypographyBlack54 = withStyles({
  root: {
    color: 'var(--textSecondary)',
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

    const embedCard = (() => {
      if (isImage) {
        return (
          <ImageMediaCard
            key={media.dynamic_annotation_flag}
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
            projectMedia={media}
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
              <TypographyBlack54 variant="body1" color="var(--textSecondary)">
                { media.extracted_text ?
                  <FormattedMessage id="mediaExpanded.extractedText" defaultMessage="Text extracted from image:" description="Label for text extracted from the image below" /> :
                  <FormattedMessage id="mediaExpanded.noExtractedText" defaultMessage="No text extracted from this image" description="Label when text extracted from an image is not available" />
                }
              </TypographyBlack54>
            </Box> : null
          }
          { isMedia ?
            <Box mb={2}>
              <TypographyBlack54 variant="body1" color="var(--textSecondary">
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
              <Typography variant="body1">
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
              <MediaCardLargeActions projectMedia={media} />
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

export default MediaExpandedComponent;
