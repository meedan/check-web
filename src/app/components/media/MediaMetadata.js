import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import MediaTags from './MediaTags';
import ClaimReview from './ClaimReview';
import TagMenu from '../tag/TagMenu';
import VideoAnnotationIcon from '../../../assets/images/video-anno/video-anno';
import {
  Row,
  black54,
  black87,
  title1,
  units,
  opaqueBlack05,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} 0 0;
  padding-${props => props.fromDirection}: ${units(1)};

  .media-detail__dialog-header {
    color: ${black87};
    font: ${title1};
    height: ${units(4)};
    margin-bottom: ${units(0.5)};
    margin-top: ${units(0.5)};
    margin-${props => props.fromDirection}: auto;
  }

  .media-detail__dialog-media-path {
    height: ${units(2)};
    margin-bottom: ${units(4)};
    text-align: ${props => props.fromDirection};
  }

  .media-detail__dialog-radio-group {
    margin-top: ${units(4)};
    margin-${props => props.fromDirection}: ${units(4)};
  }

  .media-detail__buttons {
    display: flex;
    alignItems: center;
    margin-${props => props.fromDirection}: auto;
  }

  svg {
    color: ${black54};
  }
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class MediaMetadata extends Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.media.picture;
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const { media, intl: { locale } } = this.props;
    const data = media.metadata;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const claimReview = data.schema && data.schema.ClaimReview ? data.schema.ClaimReview[0] : null;

    // check if the media item is either a Youtube link or an uploaded video:
    const displayExtraMediaActions = () => {
      const isYoutubeVideo = media.media.type === 'Link' && media.media.metadata.provider === 'youtube';
      const isUploadedVideo = media.media.type === 'UploadedVideo';
      const isPicture = media.picture !== null && media.picture !== undefined;
      const allowsAnnotation = isYoutubeVideo || isUploadedVideo;
      const allowsReverseSearch = isPicture;
      if (allowsAnnotation) {
        return (
          <Button color="primary" disabled={this.props.showVideoAnnotation} onClick={this.props.onVideoAnnoToggle} variant="contained" startIcon={<VideoAnnotationIcon color="action" />}>Video annotation</Button>
        );
      } else if (allowsReverseSearch) {
        return (
          <div className="media-detail__reverse-image-search">
            <small>
              <FormattedMessage
                id="mediaMetadata.reverseImageSearch"
                defaultMessage="Reverse image search"
              />
            </small>
            <br />
            <Button
              style={{
                border: '1px solid #000',
                minWidth: 115,
                marginRight: units(2),
              }}
              onClick={this.reverseImageSearchGoogle.bind(this)}
            >
              Google
            </Button>
          </div>
        );
      }
      return null;
    };

    return (
      <StyledMetadata
        fromDirection={fromDirection}
        className="media-detail__check-metadata"
      >
        { claimReview ? <Row><ClaimReview data={claimReview} /></Row> : null }
        { (media.picture || (media.media && media.media.file_path)) ?
          <Row style={{ display: 'flex', alignItems: 'center', marginBottom: units(2) }}>
            {displayExtraMediaActions()}
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
          { media.tags ? <MediaTags media={media} tags={media.tags.edges} /> : null }
        </Row>
      </StyledMetadata>
    );
  }
}

MediaMetadata.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default injectIntl(MediaMetadata);
