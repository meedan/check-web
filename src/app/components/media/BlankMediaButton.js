/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import CreateRelatedMediaDialog from './CreateRelatedMediaDialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import { safelyParseJSON } from '../../helpers';

const BlankMediaButton = ({
  ButtonComponent,
  projectMediaId,
  reverse,
  team,
}) => {
  const [showItemDialog, setShowItemDialog] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [pending, setPending] = React.useState(false);

  const handleError = (error) => {
    let errorMessage = <FormattedMessage defaultMessage="Could not save item" description="Error message displayed when saving an item fails" id="blankMediaButton.defaultErrorMessage" />;
    const json = safelyParseJSON(error.source);
    if (json && json.errors && json.errors[0] && json.errors[0].message) {
      errorMessage = json.errors[0].message;
    }
    setMessage(errorMessage);
    setPending(false);
  };

  const handleOpenItemDialog = () => {
    setShowItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setShowItemDialog(false);
  };

  const handleSuccess = (projectMediaDbid) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const newPath = `/${teamSlug}/media/${projectMediaDbid}`;
    window.location.assign(newPath);
  };

  const handleSubmitExisting = (projectMedia) => {
    setPending(true);
    setMessage(null);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BlankMediaButtonReplaceProjectMediaMutation($input: ReplaceProjectMediaInput!) {
          replaceProjectMedia(input: $input) {
            new_project_media {
              dbid
            }
          }
        }
      `,
      variables: {
        input: {
          project_media_to_be_replaced_id: reverse ? projectMedia.id : projectMediaId,
          new_project_media_id: reverse ? projectMediaId : projectMedia.id,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess(response.replaceProjectMedia.new_project_media.dbid);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  const handleSubmitNew = (value) => {
    setPending(true);
    setMessage(null);
    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        team,
        skipOptimisticResponse: true,
      }),
      {
        onSuccess: (response) => {
          handleSubmitExisting({ id: response.createProjectMedia.project_media.id });
        },
        onFailure: handleError,
      },
    );
  };

  return (
    <React.Fragment>
      <ButtonComponent onClick={handleOpenItemDialog} />
      <CreateRelatedMediaDialog
        hideNew={reverse}
        isSubmitting={pending}
        media={null}
        message={message}
        open={showItemDialog}
        showFilters
        submitButtonLabel={() => (
          <FormattedMessage
            defaultMessage="Add to report"
            description="Submit button label to dialog in which the user adds media to already existing (imported) fact-check report"
            id="blankMediaButton.addToReport"
          />
        )}
        team={team}
        title={
          reverse ?
            <FormattedMessage
              defaultMessage="Add to imported fact-check"
              description="Header to dialog in which the user adds media to already existing (imported) fact-checks"
              id="blankMediaButton.addToImportedReport"
              tagName="h6"
            /> : null
        }
        typesToShow={reverse ? ['blank'] : null}
        onDismiss={handleCloseItemDialog}
        onSelect={handleSubmitExisting}
        onSubmit={handleSubmitNew}
      />
    </React.Fragment>
  );
};

BlankMediaButton.defaultProps = {
  team: {},
  reverse: false,
  ButtonComponent: ({ onClick }) => (
    <ButtonMain
      label={
        <FormattedMessage
          defaultMessage="Add item"
          description="Button label that opens dialog in which the user can add a media item to an existing fact-check"
          id="blankMediaButton.addItem"
        />
      }
      size="default"
      theme="info"
      variant="contained"
      onClick={onClick}
    />
  ),
};

BlankMediaButton.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  team: PropTypes.object, // Only if wants to be able to create a new item
  reverse: PropTypes.bool, // When "reverse" is true, the selected report is the source
  ButtonComponent: PropTypes.func,
};

export default BlankMediaButton;
