import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TeamListsColumn from './TeamListsColumn';
import SettingsHeader from '../SettingsHeader';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import styles from './TeamLists.module.css';
import settingsStyles from '../Settings.module.css';

function clone(arrayOfObjects) {
  return JSON.parse(JSON.stringify(arrayOfObjects));
}

const TeamListsComponent = ({ team, setFlashMessage }) => {
  const [columns, setColumns] = React.useState(clone(team.list_columns || []));
  const [saving, setSaving] = React.useState(false);
  const [showConfirmSaveDialog, setShowConfirmSaveDialog] = React.useState(false);

  const hasUnsavedChanges = (JSON.stringify(columns) !== JSON.stringify(team.list_columns));

  const columnsToShow = [];
  const selectedColumns = [];
  const availableColumns = [];
  columns
    // We must keep the original index
    .forEach((column, index) => {
      if ((team.smooch_bot || column.key !== 'demand')
          // Filter out last_seen per CHECK-1565
          && column.key !== 'last_seen'
          // ...and related_count per CHECK-1745
          && column.key !== 'related_count'
          // ...and folder per CV2-2827
          && column.key !== 'folder') {
        if (column.show || column.key === 'created_at_timestamp') {
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
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamListsComponent.title"
            defaultMessage="Column settings"
            description="Header for Column settings page, where users can configure the visibility of columns in lists."
          />
        }
        helpUrl="http://help.checkmedia.org/en/articles/4637158-list-settings"
        actionButton={
          <ButtonMain
            variant="contained"
            theme="brand"
            size="default"
            disabled={saving || !hasUnsavedChanges}
            onClick={handleConfirmSave}
            label={
              <FormattedMessage id="settingsHeader.save" defaultMessage="Save" description="Button label for save columns settings" />
            }
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={cx(settingsStyles['setting-content-container'], styles['teamlist-columns'])}>
          <TeamListsColumn
            columns={selectedColumns}
            title={
              <FormattedMessage
                id="teamListsComponent.displayedColumns"
                defaultMessage="Displayed"
                description="Columns that are displayed for users in lists."
              />
            }
            onToggle={handleToggle}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            className={styles['teamlist-column-selected']}
          />
          <TeamListsColumn
            columns={availableColumns.filter(c => !/^task_value_/.test(c.key))}
            title={
              <FormattedMessage
                id="teamListsComponent.generalColumns"
                defaultMessage="General (hidden)"
                description="Columns not currently displayed for users in lists."
              />
            }
            onToggle={handleToggle}
          />
          <TeamListsColumn
            columns={availableColumns.filter(c => /^task_value_/.test(c.key))}
            title={
              <FormattedMessage
                id="teamListsComponent.metadataColumns"
                defaultMessage="Annotations (hidden)"
                description="Subtitle for Column settings page, where users can configure the visibility of annotations columns in lists."
              />
            }
            onToggle={handleToggle}
            placeholder={
              <Link to={`/${team.slug}/settings/annotation`} id="create-metadata__add-button" >
                <FormattedMessage
                  id="teamListsComponent.createMetadata"
                  defaultMessage="Create new annotation field"
                  description="Button label for create new annotation field"
                />
              </Link>
            }
          />
        </div>
      </div>
      <ConfirmDialog
        open={showConfirmSaveDialog}
        title={
          <FormattedMessage
            id="teamListsComponent.confirmSaveTitle"
            defaultMessage="Workspace columns change"
            description="Dialog title for saving columns change"
          />
        }
        blurb={
          <FormattedMessage
            id="teamListsComponent.confirmSaveText"
            tagName="p"
            defaultMessage="Are you sure? Your changes will affect all lists and be visible by all users in your workspace."
            description="Content of 'Save changes' confirmation dialog."
          />
        }
        continueButtonLabel={
          <FormattedMessage
            id="teamListsComponent.buttonLabel"
            defaultMessage="Save changes"
            description="Button label for saving changes"
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
    }),
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(TeamListsComponent);
