import React from 'react';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem, safelyParseJSON } from '../../helpers';

import CheckError from '../../CheckError';

const submitImport = (input, onCompleted, onError) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation ImportDialogCreateProjectMediaMutation($input: CreateProjectMediaInput!) {
        createProjectMedia(input: $input) {
          project_media {
            id
            dbid
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted,
    onError,
  });
};

const ImportButton = ({ onClick, disabled }) => (
  <Button
    className="import-dialog__button"
    color="primary"
    variant="contained"
    size="small"
    startIcon={<SystemUpdateAltOutlinedIcon />}
    onClick={onClick}
    disabled={disabled}
  >
    <FormattedMessage
      id="feedRequestedMedia.import"
      defaultMessage="Import"
      description="Button label for importing media into workspace action"
    />
  </Button>
);

const ImportDialog = ({
  teams,
  currentTeam,
  mediaIds,
  importedTitlePrefix,
  setFlashMessage,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTeamDbid, setSelectedTeamDbid] = React.useState(currentTeam);
  const [claimDescription, setClaimDescription] = React.useState(null);

  const handleImport = () => {
    const onCompleted = () => {
      setFlashMessage(
        <FormattedMessage
          id="importDialog.success"
          defaultMessage="Media imported successfully"
          description="Banner displayed after items are imported successfully"
        />,
        'success');
      setDialogOpen(false);
    };

    const onError = (error) => {
      const json = safelyParseJSON(error.source);
      if (json.errors[0].code === CheckError.codes.DUPLICATED) {
        setFlashMessage(CheckError.messages.DUPLICATED);
      } else {
        const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
        setFlashMessage(errorMessage);
      }
      setDialogOpen(false);
    };

    const inputCommon = {
      channel: JSON.stringify({ main: 12 }), // Shared Database
      team_id: selectedTeamDbid,
      set_claim_description: claimDescription,
    };
    const mainMediaDbid = mediaIds.shift();
    const inputMain = { ...inputCommon, media_id: mainMediaDbid, set_title: `${importedTitlePrefix}${mainMediaDbid}` };
    const onCompletedMain = (response) => {
      onCompleted();
      mediaIds.forEach((mediaDbid) => {
        const input = {
          ...inputCommon,
          media_id: mediaDbid,
          related_to_id: response.createProjectMedia.project_media.dbid,
          set_title: `${importedTitlePrefix}${mediaDbid}`,
        };

        submitImport(input, onCompleted, onError);
      });
    };

    submitImport(inputMain, onCompletedMain, onError);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeamDbid(null);
    setClaimDescription(null);
  };

  return (
    <React.Fragment>
      <ImportButton
        onClick={() => setDialogOpen(true)}
        disabled={mediaIds.length < 1}
      />
      <ConfirmProceedDialog
        open={dialogOpen}
        title={
          <FormattedMessage
            id="importDialog.importTitle"
            defaultMessage="Import data to workspace"
            description="Dialog title when importing a claim from feed page."
          />
        }
        body={(
          <React.Fragment>
            <Typography paragraph>
              <FormattedMessage
                id="importDialog.importDescription"
                defaultMessage="A new claim will be created in your workspace with all selected media."
                description="Dialog description when importing a claim from feed page."
              />
            </Typography>
            <Box my={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="import-to-workspace-label">
                  <FormattedMessage
                    id="feedItem.importSelectLabel"
                    defaultMessage="Import into"
                    description="Select field label used in import claim dialog from feed page."
                  />
                </InputLabel>
                <Select
                  labelId="import-to-workspace-label"
                  value={selectedTeamDbid}
                  onChange={(e) => { setSelectedTeamDbid(e.target.value); }}
                  label={
                    <FormattedMessage
                      id="feedItem.importSelectLabel"
                      defaultMessage="Import into"
                      description="Select field label used in import claim dialog from feed page."
                    />
                  }
                >
                  { teams.edges
                    .map(team => team.node)
                    .sort((a, b) => (a.name > b.name) ? 1 : -1).map(team => (
                      <MenuItem value={team.dbid} key={team.dbid}>{team.name}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                label={
                  <FormattedMessage
                    id="feedItem.importTextLabel"
                    defaultMessage="Claim"
                    description="Text field that prompts user to add a claim for related media."
                  />
                }
                variant="outlined"
                onChange={(e) => { setClaimDescription(e.target.value); }}
                defaultValue={claimDescription}
                multiline
                rows={3}
                rowsMax={Infinity}
                fullWidth
              />
            </Box>
          </React.Fragment>
        )}
        proceedDisabled={!selectedTeamDbid || !claimDescription}
        proceedLabel={<FormattedMessage id="feedItem.proceedImport" defaultMessage="Import" description="Button label to confirm importing claim from feed page" />}
        onProceed={handleImport}
        onCancel={handleCloseDialog}
      />
    </React.Fragment>
  );
};

const ImportDialogWithFlashMessage = withSetFlashMessage(ImportDialog);

const ImportDialogQuery = ({ mediaIds, importedTitlePrefix }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ImportDialogQuery {
        me {
          current_team_id
          teams(first: 10000) {
            edges {
              node {
                dbid
                name
              }
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<ImportDialogWithFlashMessage teams={props.me.teams} currentTeam={props.me.current_team_id} mediaIds={mediaIds} importedTitlePrefix={importedTitlePrefix} />);
      }
      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

export { ImportButton };
export default ImportDialogQuery;
