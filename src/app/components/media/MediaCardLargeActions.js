import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import RefreshButton from './RefreshButton';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import MediaLanguageSwitcher from './MediaLanguageSwitcher';
import SearchIcon from '../../icons/search.svg';
import OpenInNewIcon from '../../icons/open_in_new.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './MediaCardLarge.module.css';
import CheckMediaTypes from '../../constants/CheckMediaTypes';

const ExtraMediaActions = ({
  projectMedia,
  reverseImageSearchGoogle,
}) => {
  const isYoutubeVideo = projectMedia.media.type === CheckMediaTypes.LINK && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === CheckMediaTypes.UPLOADEDVIDEO;
  const isPicture = !!projectMedia.picture && !isYoutubeVideo;
  const isVideo = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || isVideo;

  if (projectMedia.media.type === CheckMediaTypes.CLAIM) return null;

  return (
    <>
      { (projectMedia.media && projectMedia.media.url) ?
        <ButtonMain
          buttonProps={{
            id: 'media-expanded-actions__reverse-image-search',
          }}
          iconLeft={<OpenInNewIcon />}
          label={
            <FormattedMessage
              defaultMessage="Open Link"
              description="Menu option for navigating to the original media url"
              id="mediaMetadata.openLink"
            />
          }
          size="small"
          theme="text"
          variant="contained"
          onClick={() => window.open(projectMedia.media.url)}
        /> : null
      }
      <TranscriptionButton
        projectMediaId={projectMedia.id}
        projectMediaType={projectMedia.media.type}
        transcription={projectMedia.transcription}
      />
      { allowsReverseSearch ?
        <ButtonMain
          buttonProps={{
            id: 'media-expanded-actions__reverse-image-search',
          }}
          iconLeft={<SearchIcon />}
          label={
            <FormattedMessage
              defaultMessage="Reverse Image Search"
              description="Menu option for performing reverse image searches on google or other engines"
              id="mediaMetadata.ImageSearch"
            />
          }
          size="small"
          theme="text"
          variant="contained"
          onClick={() => reverseImageSearchGoogle()}
        /> : null
      }
      <OcrButton
        hasExtractedText={Boolean(projectMedia.extracted_text)}
        projectMediaId={projectMedia.id}
        projectMediaType={projectMedia.media.type}
      />
    </>
  );
};

class MediaExpandedActions extends React.Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.projectMedia.picture;
    window.open(`https://lens.google.com/uploadbyurl?url=${imagePath}`);
  }

  render() {
    const {
      bottomSeparator,
      inModal,
      onClickMore,
      projectMedia,
    } = this.props;
    const { media } = projectMedia;

    if (media.type === CheckMediaTypes.BLANK) return null;

    return (
      <>
        { inModal ?
          <MediaLanguageSwitcher projectMedia={projectMedia} />
          : null
        }
        <div
          className={cx(
            styles['media-card-large-footer-actions'],
            {
              [styles['media-card-large-footer-modal-actions']]: bottomSeparator,
            })
          }
        >
          { media.type !== CheckMediaTypes.CLAIM ?
            <>
              { media.type === CheckMediaTypes.LINK ? <RefreshButton projectMediaId={projectMedia.id} /> : null }
              <ExtraMediaActions
                projectMedia={projectMedia}
                reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
              />
            </> : null
          }
          { !inModal ?
            <ButtonMain
              label={
                <FormattedMessage
                  defaultMessage="More…"
                  description="Button to open an expanded view of the media"
                  id="mediaCardLarge.more"
                />
              }
              size="small"
              theme="text"
              variant="contained"
              onClick={onClickMore}
            />
            : null
          }
        </div>
      </>
    );
  }
}

MediaExpandedActions.propTypes = {
  projectMedia: PropTypes.shape({
    media: PropTypes.shape({
      type: PropTypes.string,
      metadata: PropTypes.shape({
        provider: PropTypes.string, // or undefined
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(MediaExpandedActions, graphql`
  fragment MediaCardLargeActions_projectMedia on ProjectMedia {
    id
    media {
      url
      type
      metadata
    }
    picture
    url
    extracted_text: annotation(annotation_type: "extracted_text") {
      __typename
    }
    ...TranscriptionButton_projectMedia
    ...MediaLanguageSwitcher_projectMedia
  }
`);

