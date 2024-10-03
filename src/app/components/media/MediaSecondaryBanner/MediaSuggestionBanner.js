import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import MediaMainItemPreview from './MediaMainItemPreview';
import Alert from '../../cds/alerts-and-prompts/Alert';
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
        defaultMessage="Updated successfully, refreshing…"
        description="Message display once suggestion is approved or rejected successfully."
        id="mediaSuggestionBanner.updateSuggestionSuccess"
      />,
      'success');
    setSaving(false);
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Error when trying to update suggestion. Please try again or contact support if the error persists."
        description="Message display when it fails to approve or reject suggestion."
        id="mediaSuggestionBanner.updateSuggestionError"
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
          // FIXME: use browserHistory.push instead of window.location.assign (once Relay issues are fixed)
          window.location.assign(`/${projectMedia.suggested_main_item.team.slug}/media/${projectMedia.suggested_main_item.dbid}`);
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
          window.location.reload();
        }
      },
      onError,
    });
  };

  return (
    <>
      { projectMedia.is_suggested && projectMedia.suggested_main_item && (
        <Alert
          content={
            <div className={styles.mediaSuggestionsBanner}>
              { projectMedia.suggested_main_item && <MediaMainItemPreview projectMedia={projectMedia.suggested_main_item} /> }
              <div className={styles.mediaSuggestionsBannerButtons}>
                <ButtonMain
                  disabled={saving}
                  iconLeft={<ApproveIcon />}
                  label={<FormattedMessage defaultMessage="Yes, they are similar" description="Button label to accept similarity suggestion." id="mediaSuggestionBanner.approve" />}
                  size="small"
                  theme="validation"
                  variant="contained"
                  onClick={handleApprove}
                />
                <ButtonMain
                  disabled={saving}
                  iconLeft={<RejectIcon />}
                  label={<FormattedMessage defaultMessage="No, keep them separate" description="Button label to reject similarity suggestion." id="mediaSuggestionBanner.reject" />}
                  size="small"
                  theme="error"
                  variant="contained"
                  onClick={handleReject}
                />
              </div>
            </div>
          }
          icon
          title={
            <FormattedMessage
              defaultMessage="Media and Requests appear to be similar to an existing item in your workspace. Are they a good match?"
              description="Title of the alert message displayed on item page for suggestions."
              id="mediaSuggestionBanner.alertTitle"
            />
          }
          variant="warning"
        />
      )}
    </>
  );
};

MediaSuggestionBanner.propTypes = {
  projectMedia: PropTypes.object.isRequired, // See fragment for details
};

// eslint-disable-next-line import/no-unused-modules
export { MediaSuggestionBanner }; // For unit test

export default createFragmentContainer(MediaSuggestionBanner, graphql`
  fragment MediaSuggestionBanner_projectMedia on ProjectMedia {
    is_suggested
    suggested_main_relationship {
      id
    }
    suggested_main_item {
      dbid
      team {
        slug
      }
      ...MediaMainItemPreview_projectMedia
    }
  }
`);
