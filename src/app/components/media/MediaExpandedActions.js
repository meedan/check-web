/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RefreshButton from './RefreshButton';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import ExternalLink from '../ExternalLink';

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

  return (
    <div className="media-expanded-actions">
      <IconButton
        id="media-expanded-actions__menu"
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
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
    const { projectMedia } = this.props;
    const { media } = projectMedia;

    if (media.type === 'Claim' || media.type === 'Blank') return null;

    return (
      <Box display="flex" justifyContent="space-between" alignItems="center">
        { /* TODO: Implement More action to pop up media dialog */}
        <Button
          style={{ visibility: 'hidden' }}
          variant="contained"
          color="primary"
        >
          <FormattedMessage
            id="mediaCardLarge.more"
            description="Button to open an expanded view of the media"
            defaultMessage="More"
          />
        </Button>
        <Box display="flex">
          <RefreshButton projectMediaId={projectMedia.id} />
          <ExtraMediaActions
            projectMedia={projectMedia}
            reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
          />
        </Box>
      </Box>
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
  # projectMedia: graphql
  fragment MediaExpandedActions_projectMedia on ProjectMedia {
    id
    picture
    transcription: annotation(annotation_type: "transcription") {
      data
    }
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    url
    media {
      url
      type
      metadata
      file_path
    }
  }
`);
