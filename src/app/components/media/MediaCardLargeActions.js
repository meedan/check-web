/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Menu,
  MenuItem,
} from '@material-ui/core';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MoreVertIcon from '../../icons/more_vert.svg';
import RefreshButton from './RefreshButton';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import ExternalLink from '../ExternalLink';
import MediaLanguageSwitcher from './MediaLanguageSwitcher';

const ExtraMediaActions = ({
  projectMedia,
  reverseImageSearchGoogle,
}) => {
  const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
  const isPicture = !!projectMedia.picture && !isYoutubeVideo;
  const isVideo = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || isVideo;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuAndClose = (callback) => {
    if (callback) callback();
    setAnchorEl(null);
  };

  if (projectMedia.media.type === 'Claim') return null;

  return (
    <div className="media-expanded-actions">
      <ButtonMain
        iconCenter={<MoreVertIcon />}
        variant="contained"
        size="small"
        theme="text"
        onClick={e => setAnchorEl(e.currentTarget)}
        buttonProps={{
          id: 'media-expanded-actions__menu',
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { (projectMedia.media && projectMedia.media.url) ?
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ExternalLink
              url={projectMedia.media.url}
              style={{ color: 'unset', textDecoration: 'none' }}
            >
              <FormattedMessage
                id="mediaMetadata.openLink"
                defaultMessage="Open link"
                description="Menu option for navigating to the original media url"
              />
            </ExternalLink>
          </MenuItem> : null }
        <TranscriptionButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          transcription={projectMedia.transcription}
          onClick={() => setAnchorEl(null)}
        />
        { allowsReverseSearch ?
          <MenuItem
            id="media-expanded-actions__reverse-image-search"
            onClick={() => handleMenuAndClose(reverseImageSearchGoogle)}
          >
            <FormattedMessage
              id="mediaMetadata.ImageSearch"
              defaultMessage="Reverse image search"
              description="Menu option for performing reverse image searches on google or other engines"
            />
          </MenuItem> : null }
        <OcrButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          hasExtractedText={Boolean(projectMedia.extracted_text)}
          onClick={() => setAnchorEl(null)}
        />
      </Menu>
    </div>
  );
};

class MediaExpandedActions extends React.Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.projectMedia.picture;
    window.open(`https://lens.google.com/uploadbyurl?url=${imagePath}`);
  }

  render() {
    const {
      projectMedia,
      inModal,
      onClickMore,
      bottomSeparator,
    } = this.props;
    const { media } = projectMedia;

    if (media.type === 'Blank') return null;

    return (
      <div
        style={
          bottomSeparator ?
            {
              borderBottom: '1px solid var(--color-blue-81)',
              paddingBottom: '16px',
            } :
            {}
        }
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            { !inModal ?
              <ButtonMain
                label={
                  <FormattedMessage
                    id="mediaCardLarge.more"
                    description="Button to open an expanded view of the media"
                    defaultMessage="More"
                  />
                }
                onClick={onClickMore}
                variant="contained"
                size="default"
                theme="info"
              /> : null }
            { inModal ? <MediaLanguageSwitcher projectMedia={projectMedia} /> : null }
          </div>
          { media.type !== 'Claim' ?
            <Box display="flex" style={{ gap: '4px' }}>
              { media.type === 'Link' ?
                <RefreshButton projectMediaId={projectMedia.id} /> : null }
              <ExtraMediaActions
                projectMedia={projectMedia}
                reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
              />
            </Box> : null }
        </Box>
      </div>
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
    transcription: annotation(annotation_type: "transcription") {
      data
    }
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    ...MediaLanguageSwitcher_projectMedia
  }
`);
