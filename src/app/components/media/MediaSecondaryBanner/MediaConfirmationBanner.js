import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import MediaMainItemPreview from './MediaMainItemPreview';
import Alert from '../../cds/alerts-and-prompts/Alert';

const MediaConfirmationBanner = ({ projectMedia }) => (
  <>
    { projectMedia.is_confirmed && (
      <Alert
        content={
          <>
            <FormattedMessage
              component="div"
              defaultMessage="All requests for this item will be responded to by the matched item below."
              description="Content of the alert message displayed on item page for confirmed matches."
              id="mediaConfirmationBanner.alertContent"
            />
            { projectMedia.confirmed_main_item && <MediaMainItemPreview projectMedia={projectMedia.confirmed_main_item} /> }
          </>
        }
        icon
        title={
          <FormattedMessage
            defaultMessage="Media and Requests have been matched to another item in this workspace."
            description="Title of the alert message displayed on item page for confirmed matches."
            id="mediaConfirmationBanner.alertTitle"
          />
        }
        variant="success"
      />
    )}
  </>
);

MediaConfirmationBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

// eslint-disable-next-line import/no-unused-modules
export { MediaConfirmationBanner }; // For unit test

export default createFragmentContainer(MediaConfirmationBanner, graphql`
  fragment MediaConfirmationBanner_projectMedia on ProjectMedia {
    is_confirmed
    confirmed_main_item {
      ...MediaMainItemPreview_projectMedia
    }
  }
`);
