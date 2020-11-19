import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import TeamListsColumn from './TeamListsColumn';
import { checkBlue, ContentColumn } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';

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
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

function clone(arrayOfObjects) {
  return JSON.parse(JSON.stringify(arrayOfObjects));
}

const TeamListsComponent = ({ team, setFlashMessage }) => {
  const classes = useStyles();
  const [columns, setColumns] = React.useState(clone(team.list_columns || []));
  const [saving, setSaving] = React.useState(false);

  const columnsToShow = [];
  const selectedColumns = [];
  const availableColumns = [];
  // We must keep the original index
  columns.forEach((column, index) => {
    if (column.show) {
      columnsToShow.push(column.key);
      selectedColumns.push({ ...column, index });
    } else {
      availableColumns.push({ ...column, index });
    }
  });

  const handleHelp = () => {
    window.open('https://help.checkmedia.org/');
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage(<FormattedMessage id="teamListsComponent.defaultErrorMessage" defaultMessage="Could not save lists settings!" />);
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage(<FormattedMessage id="teamListsComponent.savedSuccessfully" defaultMessage="Lists settings saved successfully!" />);
  };

  const handleSave = () => {
    setSaving(true);

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
                    defaultMessage="Lists settings"
                  />
                </Typography>
                <IconButton onClick={handleHelp}>
                  <HelpIcon className={classes.helpIcon} />
                </IconButton>
              </Box>
              <Button variant="contained" color="primary" disabled={saving} onClick={handleSave}>
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
                    id="teamListsComponent.selectedColumns"
                    defaultMessage="Selected columns"
                  />
                }
                onToggle={handleToggle}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
              <Divider orientation="vertical" className={classes.divider} flexItem />
              <TeamListsColumn
                columns={availableColumns}
                title={
                  <FormattedMessage
                    id="teamListsComponent.availableColumns"
                    defaultMessage="Available columns"
                  />
                }
                onToggle={handleToggle}
              />
            </Box>
          </CardContent>
        </Card>
      </ContentColumn>
    </React.Fragment>
  );
};

TeamListsComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    list_columns: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      show: PropTypes.bool.isRequired,
      frozen: PropTypes.bool.isRequired,
    }).isRequired).isRequired,
  }).isRequired,
};

export default withSetFlashMessage(TeamListsComponent);
