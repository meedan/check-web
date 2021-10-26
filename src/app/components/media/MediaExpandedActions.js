import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Timeline from '@material-ui/icons/Timeline';
import ImageSearch from '@material-ui/icons/ImageSearch';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import {
  // Row,
  units,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} ${units(1)} 0;
`;

const ExtraMediaActions = ({
  projectMedia,
  showVideoAnnotation,
  onVideoAnnoToggle,
  reverseImageSearchGoogle,
}) => {
  const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
  const isPicture = !!projectMedia.picture;
  const allowsVideoAnnotation = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || allowsVideoAnnotation;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuAndClose = (callback) => {
    if (callback) callback();
    setAnchorEl(null);
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
  if (projectMedia.media.type === 'UploadedAudio') menuLabel = labelObj.audio;
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
        <TranscriptionButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          transcription={projectMedia.transcription}
        />
        <OcrButton
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
          hasExtractedText={Boolean(projectMedia.extracted_text)}
        />
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
      </Menu>
    </div>
  );
};

/* eslint jsx-a11y/click-events-have-key-events: 0 */
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
    } = this.props;

    // <Row style={{ display: 'flex', alignItems: 'center', marginBottom: units(2), marginLeft: units(-0.5), marginRight: units(-0.5) }}>

    return (
      <StyledMetadata className="media-detail__check-metadata">
        { (projectMedia.picture || (projectMedia.media && projectMedia.media.file_path) || (projectMedia.media.type === 'Claim' || projectMedia.media.type === 'Link')) ?
          <Box width="100%" display="flex" justifyContent="flex-end">
            <ExtraMediaActions
              projectMedia={projectMedia}
              onVideoAnnoToggle={onVideoAnnoToggle}
              showVideoAnnotation={showVideoAnnotation}
              reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
            />
          </Box> : null }
      </StyledMetadata>
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
