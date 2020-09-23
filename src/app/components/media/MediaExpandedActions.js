import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import DownloadIcon from '@material-ui/icons/MoveToInbox';
import ExternalLink from '../ExternalLink';
import VideoAnnotationIcon from '../../../assets/images/video-annotation/video-annotation';
import {
  Row,
  units,
  opaqueBlack05,
} from '../../styles/js/shared';

const StyledMetadata = styled.div`
  margin: ${units(1)} ${units(1)} 0;
`;

const useStyles = makeStyles(theme => ({
  root: {
    margin: `0 ${theme.spacing(0.5)}px`,
  },
}));

const ExtraMediaActions = ({
  projectMedia,
  showVideoAnnotation,
  onVideoAnnoToggle,
  reverseImageSearchGoogle,
}) => {
  const isYoutubeVideo = projectMedia.media.type === 'Link' && projectMedia.media.metadata.provider === 'youtube';
  const isUploadedVideo = projectMedia.media.type === 'UploadedVideo';
  const isPicture = projectMedia.picture !== null && projectMedia.picture !== undefined;
  const allowsVideoAnnotation = isYoutubeVideo || isUploadedVideo;
  const allowsReverseSearch = isPicture || allowsVideoAnnotation;
  const classes = useStyles();

  return (
    <div>
      { allowsVideoAnnotation ?
        <Button
          size="small"
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
          size="small"
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
    const imagePath = this.props.projectMedia.picture;
    window.open(`https://www.google.com/searchbyimage?image_url=${imagePath}`);
  }

  render() {
    const {
      projectMedia,
      onVideoAnnoToggle,
      showVideoAnnotation,
    } = this.props;

    return (
      <StyledMetadata className="media-detail__check-metadata">
        { (projectMedia.picture || (projectMedia.media && projectMedia.media.file_path)) ?
          <Row style={{
            display: 'flex', alignItems: 'center', marginBottom: units(2), marginLeft: units(-0.5), marginRight: units(-0.5),
          }}
          >
            <ExtraMediaActions
              projectMedia={projectMedia}
              onVideoAnnoToggle={onVideoAnnoToggle}
              showVideoAnnotation={showVideoAnnotation}
              reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
            />
            { (projectMedia.media && projectMedia.media.file_path) ?
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
                  url={this.props.projectMedia.media.file_path}
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
      </StyledMetadata>
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
  onVideoAnnoToggle: PropTypes.func.isRequired,
};

export default createFragmentContainer(MediaExpandedActions, graphql`
  # projectMedia: graphql
  fragment MediaExpandedActions_projectMedia on ProjectMedia {
    id
    dbid
    picture
    media {
      type
      metadata
      file_path
    }
  }
`);
