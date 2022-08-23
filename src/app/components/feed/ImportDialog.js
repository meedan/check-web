import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const ImportDialog = ({
  open,
  onClose,
  teams,
}) => {
  const [selectedImportingTeam, setSelectedImportingTeam] = React.useState(null);
  const [importingClaim, setImportingClaim] = React.useState(null);
  const [isImporting, setIsImporting] = React.useState(null);

  const handleImport = () => { setIsImporting(true); };

  return (
    <ConfirmProceedDialog
      open={open}
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
                value={selectedImportingTeam}
                onChange={(e) => { setSelectedImportingTeam(e.target.value); }}
                label={
                  <FormattedMessage
                    id="feedItem.importSelectLabel"
                    defaultMessage="Select workspace"
                    description="Select field label used in import claim dialog from feed page."
                  />
                }
              >
                { teams.sort((a, b) => (a.name > b.name) ? 1 : -1).map(team => (
                  <MenuItem value={team.dbid} key={team.dbid}>{team.name}</MenuItem>
                ))}
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
              onBlur={(e) => { setImportingClaim(e.target.value); }}
              defaultValue={importingClaim}
              multiline
              rows={3}
              rowsMax={Infinity}
              fullWidth
            />
          </Box>
        </React.Fragment>
      )}
      proceedDisabled={!selectedImportingTeam || !importingClaim}
      proceedLabel={<FormattedMessage id="feedItem.proceedImport" defaultMessage="Import" description="Button label to confirm importing claim from feed page" />}
      onProceed={handleImport}
      onCancel={onClose}
      isSaving={isImporting}
    />
  );
};

export default ImportDialog;
