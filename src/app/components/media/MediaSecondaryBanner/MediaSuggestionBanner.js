import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../../cds/alerts-and-prompts/Alert';
import MediaMainItemPreview from './MediaMainItemPreview';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain.js';
import ApproveIcon from '../../../icons/done.svg';
import RejectIcon from '../../../icons/clear.svg';
import styles from './MediaSecondaryBanner.module.css';

const MediaSuggestionBanner = ({ projectMedia }) => {
  const handleApprove = () => {};

  const handleReject = () => {};

  return (
    <>
      { projectMedia.is_suggested && (
        <Alert
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
            <div className={styles.mediaSuggestionsBanner}>
              { projectMedia.suggested_main_item && <MediaMainItemPreview projectMedia={projectMedia.suggested_main_item} /> }
              <div className={styles.mediaSuggestionsBannerButtons}>
                <ButtonMain
                  size="small"
                  variant="contained"
                  theme="validation"
                  iconLeft={<ApproveIcon />}
                  label={<FormattedMessage id="mediaSuggestionBanner.approve" defaultMessage="Yes, they are the same" description="Button label to accept similarity suggestion." />}
                  onClick={handleApprove}
                />
                <ButtonMain
                  size="small"
                  variant="contained"
                  theme="error"
                  iconLeft={<RejectIcon />}
                  label={<FormattedMessage id="mediaSuggestionBanner.reject" defaultMessage="No, keep them separate" description="Button label to reject similarity suggestion." />}
                  onClick={handleReject}
                />
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

MediaSuggestionBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

export default createFragmentContainer(MediaSuggestionBanner, graphql`
  fragment MediaSuggestionBanner_projectMedia on ProjectMedia {
    is_suggested
    suggested_main_item {
      ...MediaMainItemPreview_projectMedia
    }
  }
`);
