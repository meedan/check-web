import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TeamListsColumn from './TeamListsColumn';
import SettingsHeader from '../SettingsHeader';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { ContentColumn, black16 } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  link: {
    textDecoration: 'underline',
    background: '#F6F6F6',
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    minHeight: theme.spacing(10),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },

}));

function clone(arrayOfObjects) {
  return JSON.parse(JSON.stringify(arrayOfObjects));
}

const TeamListsComponent = ({ team, setFlashMessage }) => {
  const classes = useStyles();
  const [columns, setColumns] = React.useState(clone(team.list_columns || []));
  const [saving, setSaving] = React.useState(false);
  const [showConfirmSaveDialog, setShowConfirmSaveDialog] = React.useState(false);

  const hasUnsavedChanges = (JSON.stringify(columns) !== JSON.stringify(team.list_columns));

  const columnsToShow = [];
  const selectedColumns = [];
  const availableColumns = [];
  // We must keep the original index
  columns.forEach((column, index) => {
    if (team.smooch_bot ||
        (column.key !== 'last_seen' && column.key !== 'demand')) {
      if (column.show) {
        columnsToShow.push(column.key);
        selectedColumns.push({ ...column, index });
      } else {
        availableColumns.push({ ...column, index });
      }
    }
  });

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamListsComponent.defaultErrorMessage"
        defaultMessage="Could not save column settings"
        description="Warning displayed if an error occurred when saving column settings"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamListsComponent.savedSuccessfully"
        defaultMessage="Column settings saved successfully"
        description="Banner displayed when column settings are saved successfully"
      />
    ), 'success');
  };

  const handleSave = () => {
    setSaving(true);
    setShowConfirmSaveDialog(false);

    const mutation = graphql`
      mutation TeamListsComponentUpdateTeamMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            list_columns
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: team.id,
          list_columns: JSON.stringify(columnsToShow),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleConfirmSave = () => {
    if (hasUnsavedChanges) {
      setShowConfirmSaveDialog(true);
    }
  };

  const handleCloseDialogs = () => {
    setShowConfirmSaveDialog(false);
  };

  const handleToggle = (key, index) => {
    const updatedColumns = clone(columns);
    if (columnsToShow.indexOf(key) > -1) {
      updatedColumns[index].show = false;
    } else {
      updatedColumns[index].show = true;
    }
    setColumns(updatedColumns);
  };

  const handleMoveUp = (key, index) => {
    const updatedColumns = clone(columns);
    const i = columnsToShow.indexOf(key);
    const previousKey = columnsToShow[i - 1];
    const previousIndex = columns.findIndex(column => column.key === previousKey);
    [updatedColumns[previousIndex], updatedColumns[index]] =
      [updatedColumns[index], updatedColumns[previousIndex]];
    setColumns(updatedColumns);
  };

  const handleMoveDown = (key, index) => {
    const updatedColumns = clone(columns);
    const i = columnsToShow.indexOf(key);
    const nextKey = columnsToShow[i + 1];
    const nextIndex = columns.findIndex(column => column.key === nextKey);
    [updatedColumns[index], updatedColumns[nextIndex]] =
      [updatedColumns[nextIndex], updatedColumns[index]];
    setColumns(updatedColumns);
  };

  return (
    <React.Fragment>
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="teamListsComponent.title"
              defaultMessage="Column settings"
              description="Header for Column settings page, where users can configure the visibility of columns in folders, collections and lists."
            />
          }
          subtitle={
            <FormattedMessage
              id="teamListsComponent.description"
              defaultMessage="Select all the columns you want to display in all your folders, collections and lists."
              description="Subtitle for Column settings page, where users can configure the visibility of columns in folders, collections and lists."
            />
          }
          helpUrl="http://help.checkmedia.org/en/articles/4637158-list-settings"
          actionButton={
            <Button variant="contained" color="primary" disabled={saving || !hasUnsavedChanges} onClick={handleConfirmSave}>
              <FormattedMessage id="settingsHeader.save" defaultMessage="Save" />
            </Button>
          }
        />
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <TeamListsColumn
                columns={selectedColumns}
                title={
                  <FormattedMessage
                    id="teamListsComponent.displayedColumns"
                    defaultMessage="Displayed columns"
                  />
                }
                onToggle={handleToggle}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                style={{
                  background: '#F6F6F6',
                  borderRadius: '5px',
                  border: `1px solid ${black16}`,
                  padding: '.3rem 1rem .5rem 0',
                }}
              />
              <TeamListsColumn
                columns={availableColumns.filter(c => !/^task_value_/.test(c.key))}
                title={
                  <FormattedMessage
                    id="teamListsComponent.generalColumns"
                    defaultMessage="General"
                  />
                }
                onToggle={handleToggle}
              />
              <TeamListsColumn
                columns={availableColumns.filter(c => /^task_value_/.test(c.key))}
                title={
                  <FormattedMessage
                    id="teamListsComponent.metadataColumns"
                    defaultMessage="Metadata"
                  />
                }
                onToggle={handleToggle}
                placeholder={
                  <Link to={`/${team.slug}/settings/metadata`} className={classes.link} id="create-metadata__add-button" >
                    <FormattedMessage
                      id="teamListsComponent.createMetadata"
                      defaultMessage="Create new metadata field"
                    />
                  </Link>
                }
              />
            </Box>
          </CardContent>
        </Card>
      </ContentColumn>
      <ConfirmDialog
        open={showConfirmSaveDialog}
        title={
          <FormattedMessage
            id="teamListsComponent.confirmSaveTitle"
            defaultMessage="Workspace columns change"
          />
        }
        blurb={
          <FormattedMessage
            id="teamListsComponent.confirmSaveText"
            defaultMessage="Are you sure? Your changes will affect all folders, collections and lists and be visible by all users in your workspace."
          />
        }
        continueButtonLabel={
          <FormattedMessage
            id="teamListsComponent.buttonLabel"
            defaultMessage="Save changes"
          />
        }
        handleClose={handleCloseDialogs}
        handleConfirm={handleSave}
      />
    </React.Fragment>
  );
};

TeamListsComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    list_columns: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      show: PropTypes.bool.isRequired,
    }).isRequired).isRequired,
    smooch_bot: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(TeamListsComponent);
