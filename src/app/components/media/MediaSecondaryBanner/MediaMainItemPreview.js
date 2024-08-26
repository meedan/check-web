import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import cx from 'classnames/bind';
import ItemThumbnail from '../../cds/media-cards/ItemThumbnail';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain.js';
import OpenInNewIcon from '../../../icons/open_in_new.svg';
import styles from './MediaSecondaryBanner.module.css';

const MediaMainItemPreview = ({ projectMedia }) => {
  const handleClick = () => {
    window.open(projectMedia.full_url);
  };

  return (
    <div className={styles.mediaMainItemPreview}>
      <ItemThumbnail maskContent={projectMedia.show_warning_cover} picture={projectMedia.media.picture} type={projectMedia.media.type} url={projectMedia.media.url} />
      <div>
        <h6 className={cx('typography-body2-bold', styles.mediaMainItemPreviewTitle)}>
          {projectMedia.title}
        </h6>
        <ButtonMain
          iconRight={<OpenInNewIcon />}
          label={<FormattedMessage defaultMessage="View Item" description="Button label on secondary item banner. This button opens the main item." id="mediaMainItemPreview.viewItem" />}
          size="small"
          theme="lightBeige"
          variant="contained"
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

MediaMainItemPreview.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

// eslint-disable-next-line import/no-unused-modules
export { MediaMainItemPreview }; // For unit test

export default createFragmentContainer(MediaMainItemPreview, graphql`
  fragment MediaMainItemPreview_projectMedia on ProjectMedia {
    title
    full_url
    show_warning_cover
    media {
      picture
      type
      url
    }
  }
`);
