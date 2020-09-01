import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import MediaTags from './MediaTags';
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

const useStyles = makeStyles(theme => ({
  root: {
    margin: `0 ${theme.spacing(0.5)}px`,
  },
}));

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
  const classes = useStyles();

  return (
    <div>
      { allowsVideoAnnotation ?
        <Button
          classes={classes}
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
          classes={classes}
          onClick={reverseImageSearchGoogle}
          variant="outlined"
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
class MediaExpandedActions extends React.Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.media.picture;
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const { media, onTimelineCommentOpen } = this.props;

    return (
      <StyledMetadata className="media-detail__check-metadata">
        { (media.picture || (media.media && media.media.file_path)) ?
          <Row style={{
            display: 'flex', alignItems: 'center', marginBottom: units(2), marginLeft: units(-0.5), marginRight: units(-0.5),
          }}
          >
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
                  marginRight: units(0.5),
                  marginLeft: units(0.5),
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

MediaExpandedActions.propTypes = {
  media: PropTypes.shape({
    media: PropTypes.shape({
      type: PropTypes.string,
      metadata: PropTypes.shape({
        provider: PropTypes.string, // or undefined
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaExpandedActions;
