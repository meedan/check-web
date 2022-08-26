import React from 'react';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const submitImport = (input, onCompleted, onError) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation ImportDialogCreateProjectMediaMutation($input: CreateProjectMediaInput!) {
        createProjectMedia(input: $input) {
          project_media {
            id
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

const ImportDialog = ({ teams }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTeamDbid, setSelectedTeamDbid] = React.useState(null);
  const [claimDescription, setClaimDescription] = React.useState(null);

  const handleImport = () => {
    const onCompleted = () => {
      console.log('OH YAY'); // eslint-disable-line
    };
    const onError = () => {
      console.log('OH NO'); // eslint-disable-line
    };
    const input = {
      channel: JSON.stringify({ main: 12 }), // Shared Database
      media_id: 209,
      team_id: selectedTeamDbid,
      set_claim_description: claimDescription,
    };

    submitImport(input, onCompleted, onError);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTeamDbid(null);
    setClaimDescription(null);
  };

  return (
    <React.Fragment>
      <Button
        color="primary"
        variant="contained"
        size="small"
        startIcon={<SystemUpdateAltOutlinedIcon />}
        onClick={() => setDialogOpen(true)}
      >
        <FormattedMessage
          id="feedRequestedMedia.import"
          defaultMessage="Import"
          description="Button label for importing media into workspace action"
        />
      </Button>
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
                <Select
                  labelId="import-to-workspace-label"
                  value={selectedTeamDbid}
                  onChange={(e) => { setSelectedTeamDbid(e.target.value); }}
                  label={
                    <FormattedMessage
                      id="feedItem.importSelectLabel"
                      defaultMessage="Select workspace"
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

const ImportDialogQuery = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ImportDialogQuery {
        me {
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
        return (<ImportDialog teams={props.me.teams} />);
      }
      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

export default ImportDialogQuery;
