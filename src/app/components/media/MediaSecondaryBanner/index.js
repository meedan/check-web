import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import MediaSuggestionBanner from './MediaSuggestionBanner';
import MediaConfirmationBanner from './MediaConfirmationBanner';
import styles from './MediaSecondaryBanner.module.css';

const MediaSecondaryBanner = ({ projectMedia }) => {
  if (!projectMedia.is_suggested && !projectMedia.is_confirmed) {
    return null;
  }

  return (
    <div className={styles.mediaSecondaryBanner}>
      { projectMedia.is_suggested && <MediaSuggestionBanner projectMedia={projectMedia} /> }
      { projectMedia.is_confirmed && <MediaConfirmationBanner projectMedia={projectMedia} /> }
    </div>
  );
};

MediaSecondaryBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

// eslint-disable-next-line import/no-unused-modules
export { MediaSecondaryBanner }; // For unit test

export default createFragmentContainer(MediaSecondaryBanner, graphql`
  fragment MediaSecondaryBanner_projectMedia on ProjectMedia {
    is_suggested
    is_confirmed
    ...MediaSuggestionBanner_projectMedia
    ...MediaConfirmationBanner_projectMedia
  }
`);
