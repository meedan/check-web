import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TeamListsColumn from './TeamListsColumn';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { checkBlue, ContentColumn, black16 } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';
import { isBotInstalled } from '../../../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    justifyContent: 'left',
    alignItems: 'center',
  },
  helpIcon: {
    color: checkBlue,
  },
  divider: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
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
    if (isBotInstalled(team, 'smooch') ||
        (column.key !== 'last_seen' && column.key !== 'demand')) {
      if (column.show) {
        columnsToShow.push(column.key);
        selectedColumns.push({ ...column, index });
      } else {
        availableColumns.push({ ...column, index });
      }
    }
  });

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/4637158-list-settings');
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamListsComponent.defaultErrorMessage"
        defaultMessage="Could not save list settings."
        description="Warning displayed if an error occurred when saving list settings"
      />
    ));
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamListsComponent.savedSuccessfully"
        defaultMessage="List settings saved successfully."
        description="Banner displayed when list settings are saved successfully"
      />
    ));
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
        <Card>
          <CardContent>
            <Toolbar className={classes.root}>
              <Box display="flex" justifyContent="center" className={classes.title}>
                <Typography variant="h6" component="div">
                  <FormattedMessage
                    id="teamListsComponent.title"
                    defaultMessage="List settings"
                  />
                </Typography>
                <IconButton onClick={handleHelp}>
                  <HelpIcon className={classes.helpIcon} />
                </IconButton>
              </Box>
              <Button variant="contained" color="primary" disabled={saving || !hasUnsavedChanges} onClick={handleConfirmSave}>
                <FormattedMessage
                  id="teamListsComponent.save"
                  defaultMessage="Save"
                />
              </Button>
            </Toolbar>
            <Typography>
              <FormattedMessage
                id="teamListsComponent.description"
                defaultMessage="Select all the columns you want to display in all your lists."
              />
            </Typography>
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
                  border: `2px solid ${black16}`,
                }}
              />
              <Divider orientation="vertical" className={classes.divider} flexItem />
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
              <Divider orientation="vertical" className={classes.divider} flexItem />
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
                  <Link to={`/${team.slug}/settings/metadata`} className={classes.link}>
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
            defaultMessage="Workspace list change"
          />
        }
        blurb={
          <FormattedMessage
            id="teamListsComponent.confirmSaveText"
            defaultMessage="Are you sure? Your changes will affect all lists and be visible by all users in your workspace."
          />
        }
        continueButtonLabel={
          <FormattedMessage
            id="teamListsComponent.buttonLabel"
            defaultMessage="Save changes for all lists"
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
    team_bot_installations: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          team_bot: PropTypes.shape({
            identifier: PropTypes.string,
          }),
        }),
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default withSetFlashMessage(TeamListsComponent);
