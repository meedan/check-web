/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  Menu,
  MenuItem,
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import cx from 'classnames/bind';
import RefreshButton from './RefreshButton';
import OcrButton from './OcrButton';
import TranscriptionButton from './TranscriptionButton';
import MediaLanguageSwitcher from './MediaLanguageSwitcher';
import ExternalLink from '../ExternalLink';
import MoreVertIcon from '../../icons/more_vert.svg';
import SearchIcon from '../../icons/search.svg';
import OpenInNewIcon from '../../icons/open_in_new.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './media.module.css';

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

  if (projectMedia.media.type === 'Claim') return null;

  return (
    <div className="media-expanded-actions">
      <ButtonMain
        buttonProps={{
          id: 'media-expanded-actions__menu',
        }}
        iconCenter={<MoreVertIcon />}
        size="small"
        theme="text"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        className={styles.mediaMenuList}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { (projectMedia.media && projectMedia.media.url) ?
          <MenuItem className={styles.mediaMenuItem} onClick={() => setAnchorEl(null)}>
            <ExternalLink
              style={{ color: 'unset', textDecoration: 'none' }}
              url={projectMedia.media.url}
            >
              <FormattedMessage
                defaultMessage="Open link"
                description="Menu option for navigating to the original media url"
                id="mediaMetadata.openLink"
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
            className={styles.mediaMenuItem}
            id="media-expanded-actions__reverse-image-search"
            onClick={() => handleMenuAndClose(reverseImageSearchGoogle)}
          >
            <ListItemIcon className={styles.mediaMenuIcon}>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage
                  defaultMessage="Reverse image search"
                  description="Menu option for performing reverse image searches on google or other engines"
                  id="mediaMetadata.ImageSearch"
                />
              }
            />
          </MenuItem> : null }
        <OcrButton
          hasExtractedText={Boolean(projectMedia.extracted_text)}
          projectMediaId={projectMedia.id}
          projectMediaType={projectMedia.media.type}
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
    const {
      bottomSeparator,
      inModal,
      onClickMore,
      projectMedia,
    } = this.props;
    const { media } = projectMedia;

    if (media.type === 'Blank') return null;

    return (
      <div
        className={cx(
          styles['media-card-large-footer-actions'],
          {
            [styles['media-card-large-footer-modal-actions']]: bottomSeparator,
          })
        }
      >
        { !inModal ?
          <ButtonMain
            iconRight={<OpenInNewIcon />}
            label={
              <FormattedMessage
                defaultMessage="More"
                description="Button to open an expanded view of the media"
                id="mediaCardLarge.more"
              />
            }
            size="small"
            theme="text"
            variant="contained"
            onClick={onClickMore}
          />
          : <MediaLanguageSwitcher projectMedia={projectMedia} />
        }
        { media.type !== 'Claim' ?
          <div>
            { media.type === 'Link' ?
              <RefreshButton projectMediaId={projectMedia.id} /> : null }
            <ExtraMediaActions
              projectMedia={projectMedia}
              reverseImageSearchGoogle={this.reverseImageSearchGoogle.bind(this)}
            />
          </div> : null }
      </div>
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
  fragment MediaCardLargeActions_projectMedia on ProjectMedia {
    id
    media {
      url
      type
      metadata
    }
    picture
    url
    transcription: annotation(annotation_type: "transcription") {
      data
    }
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    ...MediaLanguageSwitcher_projectMedia
  }
`);
