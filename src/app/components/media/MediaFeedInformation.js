import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';

const MediaFeedInformation = ({ projectMedia }) => {
  if (!projectMedia.imported_from_feed_id && !projectMedia.imported_from_project_media_id) {
    return null;
  }

  const handleViewSharedFeed = () => {
    window.open(`/${projectMedia.team.slug}/feed/${projectMedia.imported_from_feed_id}/item/${projectMedia.imported_from_project_media_id}`);
  };

  return (
    <>
      <Alert
        buttonLabel={
          <FormattedMessage
            defaultMessage="View Shared Feed"
            description="Label of action button in alert box displayed on media modal when this media was imported from a feed."
            id="mediaFeedInformation.viewSharedFeed"
          />
        }
        content={
          <FormattedMessage
            defaultMessage="This media was imported from a shared feed: {feedTitle}"
            description="Content of alert box displayed on media modal when this media was imported from a feed."
            id="mediaFeedInformation.importedMediaContent"
            values={{ feedTitle: <strong>{projectMedia.imported_from_feed.name}</strong> }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Imported Media"
            description="Singular. Title of alert box displayed on media modal when this media was imported from a feed."
            id="mediaFeedInformation.importedMediaTitle"
          />
        }
        variant="info"
        onButtonClick={handleViewSharedFeed}
      />
    </>
  );
};

MediaFeedInformation.propTypes = {
  projectMedia: PropTypes.shape({
    imported_from_project_media_id: PropTypes.number,
    imported_from_feed_id: PropTypes.number,
    imported_from_feed: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
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
    team {
      slug
    }
  }
`);
