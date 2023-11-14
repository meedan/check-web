import React from 'react';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateRelatedMediaDialog from './CreateRelatedMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import { safelyParseJSON } from '../../helpers';

const BlankMediaButton = ({
  projectMediaId,
  team,
  reverse,
  ButtonComponent,
}) => {
  const [showItemDialog, setShowItemDialog] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [pending, setPending] = React.useState(false);

  const handleError = (error) => {
    let errorMessage = <FormattedMessage id="blankMediaButton.defaultErrorMessage" defaultMessage="Could not save item" description="Error message displayed when saving an item fails" />;
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
    browserHistory.push(newPath);
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
        message={message}
        title={
          reverse ?
            <FormattedMessage
              tagName="h6"
              id="blankMediaButton.addToImportedReport"
              defaultMessage="Add to imported fact-check"
              description="Header to dialog in which the user adds media to already existing (imported) fact-checks"
            /> : null
        }
        team={team}
        open={showItemDialog}
        onDismiss={handleCloseItemDialog}
        onSubmit={handleSubmitNew}
        onSelect={handleSubmitExisting}
        media={null}
        isSubmitting={pending}
        hideNew={reverse}
        typesToShow={reverse ? ['blank'] : null}
        submitButtonLabel={() => (
          <FormattedMessage
            id="blankMediaButton.addToReport"
            defaultMessage="Add to report"
            description="Submit button label to dialog in which the user adds media to already existing (imported) fact-check report"
          />
        )}
        showFilters
      />
    </React.Fragment>
  );
};

BlankMediaButton.defaultProps = {
  team: {},
  reverse: false,
  ButtonComponent: ({ onClick }) => (
    <ButtonMain
      variant="contained"
      brand="primary"
      size="default"
      onClick={onClick}
      label={
        <FormattedMessage
          id="blankMediaButton.addItem"
          defaultMessage="Add item"
          description="Button label that opens dialog in which the user can add a media item to an existing fact-check"
        />
      }
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
