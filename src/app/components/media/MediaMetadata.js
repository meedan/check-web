import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import MediaTags from './MediaTags';
import ClaimReview from './ClaimReview';
import TagMenu from '../tag/TagMenu';
import VideoAnnotationIcon from '../../../assets/images/video-annotation/video-annotation';
import {
  Row,
  black54,
  units,
  opaqueBlack05,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} ${units(1)} 0;

  svg {
    color: ${black54};
  }
`;

const ExtraMediaActions = ({
  media,
  showVideoAnnotation,
  onVideoAnnoToggle,
  reverseImageSearchGoogle,
}) => {
  const isYoutubeVideo = media.media.type === 'Link' && media.media.metadata.provider === 'youtube';
  const isUploadedVideo = media.media.type === 'UploadedVideo';
  const isPicture = media.picture !== null && media.picture !== undefined;
  const allowsVideoAnnotation = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || allowsVideoAnnotation;

  const videoButtonStyle = {
    marginRight: units(0.5),
  };

  const ImageButtonStyle = {
    marginRight: units(0.5),
    border: '1px solid #D5D5D5',
  };

  return (
    <div>
      { allowsVideoAnnotation ?
        <Button
          style={videoButtonStyle}
          color="primary"
          disabled={showVideoAnnotation}
          onClick={onVideoAnnoToggle}
          variant="contained"
          startIcon={<VideoAnnotationIcon color="action" />}
        >
          <FormattedMessage
            id="mediaMetadata.Timeline"
            defaultMessage="Timeline"
          />
        </Button>
        : null }
      { allowsReverseSearch ?
        <Button
          style={ImageButtonStyle}
          onClick={reverseImageSearchGoogle}
        >
          <FormattedMessage
            id="mediaMetadata.ImageSearch"
            defaultMessage="Image Search"
          />
        </Button>
        : null }
    </div>
  );
};

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class MediaMetadata extends React.Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.media.picture;
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const { media, onTimelineCommentOpen } = this.props;
    const claimReview = media.metadata.schema && media.metadata.schema.ClaimReview ?
      media.metadata.schema.ClaimReview[0] : null;

    return (
      <StyledMetadata className="media-detail__check-metadata">
        { claimReview ? <Row><ClaimReview data={claimReview} /></Row> : null }
        { (media.picture || (media.media && media.media.file_path)) ?
          <Row style={{ display: 'flex', alignItems: 'center', marginBottom: units(2) }}>
            <ExtraMediaActions
              media={media}
              onVideoAnnoToggle={this.props.onVideoAnnoToggle}
              showVideoAnnotation={this.props.showVideoAnnotation}
              reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
            />
            { (media.media && media.media.file_path) ?
              <div
                className="media-detail__download"
                style={{
                  alignSelf: 'flex-end',
                  display: 'flex',
                }}
              >
                <ExternalLink
                  url={this.props.media.media.file_path}
                  style={{
                    cursor: 'pointer',
                    height: 36,
                    overflow: 'hidden',
                    borderRadius: '50%',
                    background: opaqueBlack05,
                    display: 'inline-block',
                    textAlign: 'center',
                    alignSelf: 'flex-end',
                  }}
                >
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="mediaMetadata.download"
                        defaultMessage="Download"
                      />
                    }
                  >
                    <DownloadIcon style={{ margin: 6 }} />
                  </Tooltip>
                </ExternalLink>
              </div> : null }
          </Row> : null }
        <Row>
          <TagMenu media={media} />
          { media.tags ?
            <MediaTags
              media={media}
              tags={media.tags.edges}
              onTimelineCommentOpen={onTimelineCommentOpen}
            />
            : null
          }
        </Row>
      </StyledMetadata>
    );
  }
}

MediaMetadata.propTypes = {
  media: PropTypes.shape({
    media: PropTypes.shape({
      type: PropTypes.string,
      metadata: PropTypes.shape({
        provider: PropTypes.string, // or undefined
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaMetadata;
