import React from 'react';
import { createFragmentContainer, commitMutation, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import CreateMediaInput from '../CreateMediaInput';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import AddIcon from '../../../icons/add.svg';
import IconClose from '../../../icons/clear.svg';
import styles from '../../../styles/css/dialog.module.css';
import Loader from '../../cds/loading/Loader';

const CreateMediaButton = ({
  environment,
  team,
}) => {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const createMediaMutation = graphql`
    mutation CreateMediaButtonCreateMutation($input: CreateProjectMediaInput!) {
      createProjectMedia(input: $input) {
        project_media {
          dbid
        }
      }
    }
  `;

  const handleError = (err) => {
    setOpen(false);
    const errorMessage = getErrorMessageForRelayModernProblem(err) || <GenericUnknownErrorMessage />;
    setSaving(false);
    setFlashMessage(errorMessage, 'error');
    // if there's an existing media item, redirect to its media page
    if (err[0].data?.url?.length) {
      browserHistory.push(err[0].data.url);
    }
  };

  const navigateToMedia = (mediaId) => {
    browserHistory.push(`/${team.slug}/media/${mediaId}`);
  };

  const handleSubmit = (value) => {
    if (!value) {
      return;
    }

    setSaving(true);

    const uploadables = {};
    if (value.file) {
      uploadables.file = value.file;
    }

    commitMutation(environment, {
      mutation: createMediaMutation,
      variables: {
        input: {
          media_type: value.mediaType,
          set_claim_description: value.claimDescription,
          url: value.url,
          quote: value.quote,
        },
      },
      uploadables,
      onCompleted: (response, err) => {
        if (err) {
          handleError(err);
        } else {
          setSaving(false);
          setOpen(false);
          navigateToMedia(response.createProjectMedia.project_media.dbid);
        }
      },
    });
  };

  return (
    <>
      <ButtonMain
        buttonProps={{
          id: 'create-media-button__open-button',
        }}
        iconLeft={<AddIcon />}
        label={
          <FormattedMessage
            defaultMessage="Add Media Cluster"
            description="Label of a button that opens a form to create a new media cluster."
            id="createMediaButton.newMediaItem"
          />
        }
        size="default"
        theme="lightBeige"
        variant="contained"
        onClick={() => { setOpen(true); }}
      />
      <Dialog className={styles['dialog-window']} fullWidth open={open}>
        <div className={styles['dialog-title']}>
          <FormattedMessage defaultMessage="Add New Media Cluster" description="Dialog title for adding a new cluster of media" id="createMediaButton.addNewItem" tagName="h6" />
          <ButtonMain
            className={styles['dialog-close-button']}
            disabled={saving}
            iconCenter={<IconClose />}
            size="small"
            theme="text"
            variant="text"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className={styles['dialog-content']}>
          { !saving ? <CreateMediaInput formId="create-media-dialog-form" team={team} onSubmit={handleSubmit} /> : <Loader size="medium" theme="white" variant="inline" />}
        </div>
        <div className={styles['dialog-actions']}>
          <ButtonMain
            buttonProps={{
              id: 'create-media-button__dismiss-button',
            }}
            disabled={saving}
            label={
              <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={() => setOpen(false)}
          />
          <ButtonMain
            buttonProps={{
              id: 'create-media-button__submit-button',
              form: 'create-media-dialog-form',
              type: 'submit',
            }}
            disabled={saving}
            label={
              <FormattedMessage
                defaultMessage="Add Media Cluster"
                description="Label of a button that submits the form to creata new media cluster"
                id="createMediaButton.addNewMediaCluster"
              />
            }
            size="default"
            theme="info"
            variant="contained"
          />
        </div>
      </Dialog>
    </>
  );
};

CreateMediaButton.propTypes = {
  environment: PropTypes.object.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(CreateMediaButton, graphql`
  fragment CreateMediaButton_team on Team {
    dbid
    slug
  }
`);
