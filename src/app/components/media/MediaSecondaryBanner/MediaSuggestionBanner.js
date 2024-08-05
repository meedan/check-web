import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Alert from '../../cds/alerts-and-prompts/Alert';
import MediaMainItemPreview from './MediaMainItemPreview';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain.js';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ApproveIcon from '../../../icons/done.svg';
import RejectIcon from '../../../icons/clear.svg';
import styles from './MediaSecondaryBanner.module.css';

const rejectMutation = graphql`
  mutation MediaSuggestionBannerDestroyRelationshipMutation($input: DestroyRelationshipInput!) {
    destroyRelationship(input: $input) {
      deletedId
    }
  }
`;

const approveMutation = graphql`
  mutation MediaSuggestionBannerUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
    updateRelationship(input: $input) {
      relationship {
        id
      }
    }
  }
`;

const MediaSuggestionBanner = ({ projectMedia }) => {
  const [saving, setSaving] = React.useState(false);

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onSuccess = () => {
    setFlashMessage(
      <FormattedMessage
        id="mediaSuggestionBanner.updateSuggestionSuccess"
        defaultMessage="Updated successfully, refreshing..."
        description="Message display once suggestion is approved or rejected successfully."
      />,
      'success');
    setSaving(false);
    window.location.reload();
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        id="mediaSuggestionBanner.updateSuggestionError"
        defaultMessage="Error when trying to update suggestion. Please try again or contact the support if the error persists."
        description="Message display when it fails to approve or reject suggestion."
      />,
      'error');
    setSaving(false);
  };

  const handleApprove = () => {
    setSaving(true);
    commitMutation(Store, {
      mutation: approveMutation,
      variables: {
        input: {
          id: projectMedia.suggested_main_relationship.id,
          relationship_source_type: 'confirmed_sibling',
          relationship_target_type: 'confirmed_sibling',
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onError(error);
        } else {
          onSuccess();
        }
      },
      onError,
    });
  };

  const handleReject = () => {
    setSaving(true);
    commitMutation(Store, {
      mutation: rejectMutation,
      variables: {
        input: {
          id: projectMedia.suggested_main_relationship.id,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onError(error);
        } else {
          onSuccess();
        }
      },
      onError,
    });
  };

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
                  disabled={saving}
                  iconLeft={<ApproveIcon />}
                  label={<FormattedMessage id="mediaSuggestionBanner.approve" defaultMessage="Yes, they are similar" description="Button label to accept similarity suggestion." />}
                  onClick={handleApprove}
                />
                <ButtonMain
                  size="small"
                  variant="contained"
                  theme="error"
                  disabled={saving}
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
    suggested_main_relationship {
      id
    }
    suggested_main_item {
      ...MediaMainItemPreview_projectMedia
    }
  }
`);
