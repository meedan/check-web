import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import MediaSuggestionBanner from './MediaSuggestionBanner';
import MediaConfirmationBanner from './MediaConfirmationBanner';

const MediaSecondaryBanner = ({ projectMedia }) => (
  <>
    { projectMedia.is_suggested && <MediaSuggestionBanner projectMedia={projectMedia} /> }
    { projectMedia.is_confirmed && <MediaConfirmationBanner projectMedia={projectMedia} /> }
  </>
);

MediaSecondaryBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

export default createFragmentContainer(MediaSecondaryBanner, graphql`
  fragment MediaSecondaryBanner_projectMedia on ProjectMedia {
    is_suggested
    is_confirmed
    ...MediaSuggestionBanner_projectMedia
    ...MediaConfirmationBanner_projectMedia
  }
`);
