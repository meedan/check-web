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
  ListItemText,
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import ExternalLink from '../ExternalLink';

const ExtraMediaActions = ({
  projectMedia,
  reverseImageSearchGoogle,
  onPlaybackRateChange,
}) => {
  const isUploadedAudio = projectMedia.media.type === 'UploadedAudio';
  const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
  const isPicture = !!projectMedia.picture && !isYoutubeVideo;
  const isVideo = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || isVideo;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElPlaybackSpeed, setAnchorElPlaybackSpeed] = React.useState(null);

  const handleMenuAndClose = (callback) => {
    if (callback) callback();
    setAnchorEl(null);
  };

  const handlePlaybackRateChange = (r) => {
    onPlaybackRateChange(r);
    setAnchorEl(null);
    setAnchorElPlaybackSpeed(null);
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
        { (projectMedia.media && projectMedia.media.file_path) ?
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ExternalLink
              url={projectMedia.media.file_path}
              style={{ color: 'unset', textDecoration: 'none' }}
            >
              <FormattedMessage
                id="mediaMetadata.download"
                defaultMessage="Download"
                description="Menu option for downloading the original file of current item"
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
        { (isVideo && !isYoutubeVideo) || isUploadedAudio ?
          <MenuItem onClick={e => setAnchorElPlaybackSpeed(e.currentTarget)}>
            <ListItemText>
              <FormattedMessage
                id="mediaMetadata.playbackSpeed"
                defaultMessage="Playback speed"
                description="Menu option for altering playback speed of video/audio clip"
              />
            </ListItemText>
            <ArrowRightIcon />
          </MenuItem> : null }
        <OcrButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          hasExtractedText={Boolean(projectMedia.extracted_text)}
          onClick={() => setAnchorEl(null)}
        />
      </Menu>
      <Menu
        anchorEl={anchorElPlaybackSpeed}
        open={Boolean(anchorElPlaybackSpeed)}
        onClose={() => setAnchorElPlaybackSpeed(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handlePlaybackRateChange(0.25)}>0.25x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(0.5)}>0.5x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(0.75)}>0.75x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(1)}>
          <FormattedMessage id="media.normalSpeed" defaultMessage="Normal speed" description="Sets video playback rate to original 1x speed" />
        </MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(1.25)}>1.25x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(1.5)}>1.5x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(1.75)}>1.75x</MenuItem>
        <MenuItem onClick={() => handlePlaybackRateChange(2)}>2x</MenuItem>
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
      onPlaybackRateChange,
    } = this.props;

    const isUploadedAudio = projectMedia.media.type === 'UploadedAudio';
    const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
    const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
    const isPicture = !!projectMedia.picture;
    const isVideo = isYoutubeVideo || isUploadedVideo;

    if (!isPicture && !isVideo && !isUploadedAudio) return null;

    return (
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary">
          <FormattedMessage
            id="mediaCardLarge.more"
            description="Button to open an expanded view of the media"
            defaultMessage="More"
          />
        </Button>
        <ExtraMediaActions
          projectMedia={projectMedia}
          onPlaybackRateChange={onPlaybackRateChange}
          reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
        />
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
    media {
      type
      metadata
      file_path
    }
  }
`);
