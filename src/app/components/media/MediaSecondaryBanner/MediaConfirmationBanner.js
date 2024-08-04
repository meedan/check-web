import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../../cds/alerts-and-prompts/Alert';
import MediaMainItemPreview from './MediaMainItemPreview';

const MediaConfirmationBanner = ({ projectMedia }) => (
  <Alert
    icon
    variant="success"
    title={
      <FormattedMessage
        id="mediaConfirmationBanner.alertTitle"
        defaultMessage="Requests and Media have been matched to another item in this workspace."
        description="Title of the alert message displayed on item page for confirmed matches."
      />
    }
    content={
      <>
        <FormattedMessage
          id="mediaConfirmationBanner.alertContent"
          defaultMessage="All requests for this item will be responded to by the matched item below."
          description="Content of the alert message displayed on item page for confirmed matches."
          component="div"
        />
        { projectMedia.confirmed_main_item && <MediaMainItemPreview projectMedia={projectMedia.confirmed_main_item} /> }
      </>
    }
  />
);

MediaConfirmationBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

export default createFragmentContainer(MediaConfirmationBanner, graphql`
  fragment MediaConfirmationBanner_projectMedia on ProjectMedia {
    confirmed_main_item {
      ...MediaMainItemPreview_projectMedia
    }
  }
`);
