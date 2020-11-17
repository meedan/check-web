import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import CreateRelatedMediaDialog from './CreateRelatedMediaDialog';
import ConfirmDialog from '../layout/ConfirmDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import { safelyParseJSON } from '../../helpers';

function itemLink(itemDbid) {
  return window.location.href.replace(/media\/[0-9]+/, `media/${itemDbid}`);
}

const useStyles = makeStyles(theme => ({
  box: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const BlankMediaButton = ({
  projectMediaId,
  team,
  reverse,
  label,
  ButtonProps,
}) => {
  const classes = useStyles();
  const [showItemDialog, setShowItemDialog] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [pending, setPending] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleError = (error) => {
    let errorMessage = <FormattedMessage id="blankMediaButton.defaultErrorMessage" defaultMessage="Could not save item" />;
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

  const handleCloseConfirmationDialog = () => {
    setShowConfirmationDialog(false);
  };

  const handleSuccess = (projectMediaDbid) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    const newPath = `/${teamSlug}/media/${projectMediaDbid}`;
    window.location.href = window.location.href.replace(window.location.pathname, newPath);
  };

  const handleSubmitExisting = (projectMedia, confirmed) => {
    if (projectMedia.isPublished && !confirmed) {
      setSelectedItem(projectMedia);
      setShowConfirmationDialog(true);
    } else {
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
    }
  };

  const handleConfirmReplace = () => {
    handleSubmitExisting(selectedItem, true);
  };

  const handleSubmitNew = (value) => {
    setPending(true);
    setMessage(null);
    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        team,
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
      <Button variant="contained" color="primary" onClick={handleOpenItemDialog} {...ButtonProps}>
        {label}
      </Button>
      <CreateRelatedMediaDialog
        message={message}
        title={
          reverse ?
            <FormattedMessage
              id="blankMediaButton.addToImportedReport"
              defaultMessage="Add to imported report"
            /> : null
        }
        open={showItemDialog}
        onDismiss={handleCloseItemDialog}
        onSubmit={handleSubmitNew}
        onSelect={handleSubmitExisting}
        media={null}
        isSubmitting={pending}
        hideNew={reverse}
        typesToShow={reverse ? ['blank'] : null}
      />
      { selectedItem ?
        <ConfirmDialog
          open={showConfirmationDialog}
          title={
            <FormattedMessage
              id="blankMediaButton.confirmTitle"
              defaultMessage="Overwrite report and status?"
            />
          }
          blurb={
            <FormattedMessage
              id="blankMediaButton.confirmText"
              defaultMessage="The following item already has a published report:
              {link}
              If you proceed, both the status and the report will be overwritten, and the report will be paused."
              values={{
                link: (
                  <Box className={classes.box}>
                    <a href={itemLink(selectedItem.value)} target="_blank" rel="noopener noreferrer">
                      {itemLink(selectedItem.value)}
                    </a>
                  </Box>
                ),
              }}
            />
          }
          continueButtonLabel={
            <FormattedMessage
              id="blankMediaButton.confirmButtonLabel"
              defaultMessage="Pause report and update content"
            />
          }
          handleClose={handleCloseConfirmationDialog}
          handleConfirm={handleConfirmReplace}
        /> : null }
    </React.Fragment>
  );
};

BlankMediaButton.defaultProps = {
  label: <FormattedMessage id="blankMediaButton.addItem" defaultMessage="Add item" />,
  reverse: false,
  ButtonProps: {},
};

BlankMediaButton.propTypes = {
  label: PropTypes.object,
  projectMediaId: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired,
  ButtonProps: PropTypes.object,
  reverse: PropTypes.bool, // When "reverse" is true, the selected report is the source
};

export default BlankMediaButton;
