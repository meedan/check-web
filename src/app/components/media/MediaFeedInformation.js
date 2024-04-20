import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';

const MediaFeedInformation = ({ projectMedia }) => {
  if (!projectMedia.imported_from_feed_id && !projectMedia.imported_from_project_media_id) {
    return null;
  }

  return (
    <Alert
      title={
        <FormattedMessage
          id="mediaFeedInformation.importedMediaTitle"
          defaultMessage="Imported Media"
          description="Singular. Title of alert box displayed on media modal when this media was imported from a feed."
        />
      }
      content={
        <FormattedMessage
          id="mediaFeedInformation.importedMediaContent"
          defaultMessage="This media was imported from a shared feed: {feedTitle}"
          description="Content of alert box displayed on media modal when this media was imported from a feed."
          values={{ feedTitle: projectMedia.imported_from_feed.name }}
        />
      }
      variant="info"
    />
  );
};

MediaFeedInformation.propTypes = {
  projectMedia: PropTypes.shape({
    imported_from_project_media_id: PropTypes.number,
    imported_from_feed_id: PropTypes.number,
    imported_from_feed: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default createFragmentContainer(MediaFeedInformation, graphql`
  fragment MediaFeedInformation_projectMedia on ProjectMedia {
    imported_from_feed_id
    imported_from_project_media_id
    imported_from_feed {
      name
    }
  }
`);
