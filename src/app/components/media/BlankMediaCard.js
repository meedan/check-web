import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
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
  root: {
    minHeight: theme.spacing(50),
  },
  box: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const BlankMediaCard = ({ projectMediaId, team }) => {
  const classes = useStyles();
  const [showItemDialog, setShowItemDialog] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [pending, setPending] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleError = (error) => {
    let errorMessage = <FormattedMessage id="blankMediaCard.defaultErrorMessage" defaultMessage="Could not save item" />;
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
    browserHistory.push(`/${teamSlug}/media/${projectMediaDbid}`);
    setShowItemDialog(false);
    setShowConfirmationDialog(false);
    setMessage(null);
    setPending(false);
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
          mutation BlankMediaCardReplaceProjectMediaMutation($input: ReplaceProjectMediaInput!) {
            replaceProjectMedia(input: $input) {
              new_project_media {
                dbid
              }
            }
          }
        `,
        variables: {
          input: {
            project_media_to_be_replaced_id: projectMediaId,
            new_project_media_id: projectMedia.id,
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
      <Box className={classes.root} display="flex" justifyContent="center" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleOpenItemDialog}>
          <FormattedMessage id="blankMediaCard.addItem" defaultMessage="Add item" />
        </Button>
      </Box>
      <CreateRelatedMediaDialog
        message={message}
        title={null}
        open={showItemDialog}
        onDismiss={handleCloseItemDialog}
        onSubmit={handleSubmitNew}
        onSelect={handleSubmitExisting}
        media={null}
        isSubmitting={pending}
      />
      { selectedItem ?
        <ConfirmDialog
          open={showConfirmationDialog}
          title={
            <FormattedMessage
              id="blankMediaCard.confirmTitle"
              defaultMessage="Overwrite report and status?"
            />
          }
          blurb={
            <FormattedMessage
              id="blankMediaCard.confirmText"
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
              id="blankMediaCard.confirmButtonLabel"
              defaultMessage="Pause report and update content"
            />
          }
          handleClose={handleCloseConfirmationDialog}
          handleConfirm={handleConfirmReplace}
        /> : null }
    </React.Fragment>
  );
};

BlankMediaCard.propTypes = {
  projectMediaId: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired,
};

export default BlankMediaCard;
