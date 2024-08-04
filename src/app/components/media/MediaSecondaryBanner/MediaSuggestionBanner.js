import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../../cds/alerts-and-prompts/Alert';
import MediaMainItemPreview from './MediaMainItemPreview';

const MediaSuggestionBanner = ({ projectMedia }) => (
  <Alert
    banner
    icon
    variant="warning"
    title={
      <FormattedMessage
        id="mediaSuggestionBanner.alertTitle"
        defaultMessage="Requests and Media appear to be similar as an existing item in your workspace. Are they a good match?"
        description="Title of the alert message displayed on item page for suggestions."
      />
    }
    content={
      <>
        <MediaMainItemPreview projectMedia={projectMedia} />
      </>
    }
  />
);

MediaSuggestionBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

export default createFragmentContainer(MediaSuggestionBanner, graphql`
  fragment MediaSuggestionBanner_projectMedia on ProjectMedia {
    ...MediaMainItemPreview_projectMedia
  }
`);
