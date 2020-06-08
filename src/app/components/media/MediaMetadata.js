import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import MediaTags from './MediaTags';
import ClaimReview from './ClaimReview';
import TagMenu from '../tag/TagMenu';
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

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class MediaMetadata extends Component {
  reverseImageSearchGoogle() {
    const imagePath = this.props.media.picture;
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const { media } = this.props;
    const data = media.metadata;
    const claimReview = data.schema && data.schema.ClaimReview ? data.schema.ClaimReview[0] : null;

    return (
      <StyledMetadata className="media-detail__check-metadata">
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

export default MediaMetadata;
