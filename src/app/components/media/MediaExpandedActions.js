import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Timeline from '@material-ui/icons/Timeline';
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo';
import ImageSearch from '@material-ui/icons/ImageSearch';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';

const ExtraMediaActions = ({
  projectMedia,
  showVideoAnnotation,
  onVideoAnnoToggle,
  reverseImageSearchGoogle,
  onPlaybackRateChange,
}) => {
  const isUploadedAudio = projectMedia.media.type === 'UploadedAudio';
  const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
  const isPicture = !!projectMedia.picture;
  const allowsVideoAnnotation = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || allowsVideoAnnotation;
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

  const labelObj = {
    video: (
      <FormattedMessage
        id="mediaMetadata.videoActions"
        defaultMessage="Video actions"
        description="Actions menu for item of type Video"
      />
    ),
    image: (
      <FormattedMessage
        id="mediaMetadata.imageActions"
        defaultMessage="Image actions"
        description="Actions menu for item of type Image"
      />
    ),
    audio: (
      <FormattedMessage
        id="mediaMetadata.audioActions"
        defaultMessage="Audio actions"
        description="Actions menu for item of type Audio"
      />
    ),
  };
  let menuLabel = null;
  if (isPicture) menuLabel = labelObj.image;
  if (allowsVideoAnnotation) menuLabel = labelObj.video;
  if (isUploadedAudio) menuLabel = labelObj.audio;
  if (!menuLabel) return null;

  return (
    <div className="media-expanded-actions">
      <Button
        id="media-expanded-actions__menu"
        variant="outlined"
        onClick={e => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {menuLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { (projectMedia.media && projectMedia.media.file_path) ?
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ExternalLink
              url={projectMedia.media.file_path}
              style={{ color: 'unset', textDecoration: 'none' }}
            >
              <FormattedMessage
                id="mediaMetadata.download"
                defaultMessage="Download"
              />
            </ExternalLink>
          </MenuItem> : null }
        <TranscriptionButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          transcription={projectMedia.transcription}
        />
        { allowsReverseSearch ?
          <MenuItem
            onClick={() => handleMenuAndClose(reverseImageSearchGoogle)}
          >
            <ListItemIcon>
              <ImageSearch />
            </ListItemIcon>
            <FormattedMessage
              id="mediaMetadata.ImageSearch"
              defaultMessage="Reverse image search"
              description="Menu option for performing reverse image searches on google or other engines"
            />
          </MenuItem> : null }
        { allowsVideoAnnotation || isUploadedAudio ?
          <MenuItem onClick={e => setAnchorElPlaybackSpeed(e.currentTarget)}>
            <ListItemIcon>
              <SlowMotionVideoIcon />
            </ListItemIcon>
            <ListItemText>
              <FormattedMessage
                id="mediaMetadata.playbackSpeed"
                defaultMessage="Playback speed"
                description="Menu option for altering playback speed of video/audio clip"
              />
            </ListItemText>
            <ArrowRightIcon />
          </MenuItem> : null }
        { allowsVideoAnnotation ?
          <MenuItem
            disabled={showVideoAnnotation}
            onClick={() => handleMenuAndClose(onVideoAnnoToggle)}
          >
            <ListItemIcon>
              <Timeline />
            </ListItemIcon>
            <FormattedMessage
              id="mediaMetadata.Timeline"
              defaultMessage="Timeline"
            />
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
        <MenuItem onClick={() => handlePlaybackRateChange(1)}><FormattedMessage id="media.normalSpeed" defaultMessage="Normal speed" /></MenuItem>
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
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const {
      projectMedia,
      onVideoAnnoToggle,
      showVideoAnnotation,
      onPlaybackRateChange,
    } = this.props;

    return (
      <Box mt={1} mx={1} width="100%" className="media-detail__check-metadata">
        { (projectMedia.picture || (projectMedia.media && projectMedia.media.file_path) || (projectMedia.media.type === 'Claim' || projectMedia.media.type === 'Link')) ?
          <Box width="100%" display="flex" justifyContent="flex-end">
            <ExtraMediaActions
              projectMedia={projectMedia}
              onPlaybackRateChange={onPlaybackRateChange}
              onVideoAnnoToggle={onVideoAnnoToggle}
              showVideoAnnotation={showVideoAnnotation}
              reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
            />
          </Box> : null }
      </Box>
    );
  }
}

MediaExpandedActions.propTypes = {
  projectMedia: PropTypes.shape({
    title: PropTypes.string.isRequired,
    media: PropTypes.shape({
      quote: PropTypes.string,
      type: PropTypes.string,
      metadata: PropTypes.shape({
        provider: PropTypes.string, // or undefined
      }).isRequired,
    }).isRequired,
  }).isRequired,
  onVideoAnnoToggle: PropTypes.func.isRequired,
};

export default createFragmentContainer(MediaExpandedActions, graphql`
  # projectMedia: graphql
  fragment MediaExpandedActions_projectMedia on ProjectMedia {
    id
    dbid
    picture
    title
    transcription: annotation(annotation_type: "transcription") {
      data
    }
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    media {
      quote
      type
      metadata
      file_path
    }
  }
`);
