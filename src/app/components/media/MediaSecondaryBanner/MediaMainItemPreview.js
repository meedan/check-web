import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';

const MediaMainItemPreview = ({ projectMedia }) => (
  <p>{projectMedia.title}</p>
);

MediaMainItemPreview.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

export default createFragmentContainer(MediaMainItemPreview, graphql`
  fragment MediaMainItemPreview_projectMedia on ProjectMedia {
    title
  }
`);
