import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import FlatButton from 'material-ui/FlatButton';
import Tooltip from '@material-ui/core/Tooltip';
import DownloadIcon from 'material-ui/svg-icons/content/move-to-inbox';
import ExternalLink from '../ExternalLink';
import MediaTags from './MediaTags';
import ClaimReview from './ClaimReview';
import TagMenu from '../tag/TagMenu';
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
  constructor(props) {
    super(props);

    this.state = {
    };
  }

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

    return (
      <StyledMetadata
        fromDirection={fromDirection}
        className="media-detail__check-metadata"
      >
        { claimReview ? <Row><ClaimReview data={claimReview} /></Row> : null }
        { (media.picture || (media.media && media.media.file_path)) ?
          <Row style={{ display: 'flex', alignItems: 'center', marginBottom: units(2) }}>
            { media.picture ?
              <div className="media-detail__reverse-image-search">
                <small>
                  <FormattedMessage
                    id="mediaMetadata.reverseImageSearch"
                    defaultMessage="Reverse image search"
                  />
                </small>
                <br />
                <FlatButton
                  label="Google"
                  style={{
                    border: '1px solid #000',
                    minWidth: 115,
                    marginRight: units(2),
                  }}
                  onClick={this.reverseImageSearchGoogle.bind(this)}
                />
              </div> : null }
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

MediaMetadata.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(MediaMetadata);
