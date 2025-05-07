import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { injectIntl, defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import cx from 'classnames/bind';
import Alert from '../../cds/alerts-and-prompts/Alert';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import Can from '../../Can'; // eslint-disable-line import/no-duplicates
import searchResultsStyles from '../../search/SearchResults.module.css';
import IconMoreVert from '../../../icons/more_vert.svg';

const messages = defineMessages({
  actionsTooltip: {
    id: 'savedSearchActions.tooltip',
    defaultMessage: 'Actions',
    description: 'Toolitp for the button that shows actions that can be performed on a list',
  },
});

const SavedSearchActions = ({
  intl,
  savedSearch,
  setFlashMessage,
}) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { team } = savedSearch;

  if (!team) {
    return null;
  }

  const handleClose = () => {
    setAnchorEl(null);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Error, please try again"
        description="Generic error message displayed when it's not possible to update or delete a list"
        id="savedSearchActions.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Done"
        description="Generic success message displayed when a list is updated or deleted"
        id="savedSearchActions.savedSuccessfully"
      />
    ), 'success');
    setNewTitle('');
    handleClose();
  };

  const handleUpdate = () => {
    setSaving(true);
    const input = {
      id: savedSearch.id,
    };
    if (newTitle) {
      input.title = newTitle;
    }
    const updateMutation = graphql`
      mutation SavedSearchActionsUpdateSavedSearchMutation($input: UpdateSavedSearchInput!) {
        updateSavedSearch(input: $input) {
          saved_search {
            id
            title
            medias_count: items_count
          }
        }
      }
    `;
    commitMutation(Store, {
      mutation: updateMutation,
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleDelete = () => {
    setSaving(true);
    const input = { id: savedSearch.id };
    const deleteMutation = graphql`
      mutation SavedSearchActionsDestroySavedSearchMutation($input: DestroySavedSearchInput!) {
        destroySavedSearch(input: $input) {
          deletedId
          team {
            id
          }
        }
      }
    `;
    commitMutation(Store, {
      mutation: deleteMutation,
      variables: { input },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          const retPath = savedSearch.list_type === 'article' ? `/${team.slug}/articles/all` : `/${team.slug}/all-items`;
          browserHistory.push(retPath);
        }
      },
      onError: () => {
        handleError();
      },
      optimisticResponse: {
        destroyProject: {
          deletedId: savedSearch.id,
          team: {
            id: team.id,
          },
        },
      },
      configs: [
        {
          type: 'RANGE_DELETE',
          parentID: team.id,
          pathToConnection: ['team', 'saved_searches'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'NODE_DELETE',
          deletedIDFieldName: 'deletedId',
        },
      ],
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <Can permission="create SavedSearch" permissions={team.permissions}>
      <ButtonMain
        className={cx('saved-search-actions', searchResultsStyles.searchHeaderActionButton)}
        iconCenter={<IconMoreVert className="saved-search-actions__icon" />}
        size="small"
        theme="text"
        title={intl.formatMessage(messages.actionsTooltip)}
        variant="outlined"
        onClick={(e) => { setAnchorEl(e.currentTarget); }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className="saved-search-actions__edit" onClick={() => { setShowEditDialog(true); }}>
          <ListItemText
            primary={
              <FormattedMessage
                defaultMessage="Rename"
                description="'Rename' here is an infinitive verb"
                id="savedSearchActions.rename"
              />
            }
          />
        </MenuItem>
        <MenuItem className="saved-search-actions__destroy" onClick={handleDeleteClick}>
          <ListItemText
            primary={
              <FormattedMessage
                defaultMessage="Delete"
                description="'Delete' here is an infinitive verb"
                id="savedSearchActions.delete"
              />
            }
          />
        </MenuItem>
      </Menu>

      {/* "Edit" dialog */}
      <ConfirmProceedDialog
        body={
          <TextField
            className="saved-search-actions__edit-title"
            defaultValue={savedSearch.title}
            id="saved-search-actions__edit-title-input"
            label={
              <FormattedMessage
                defaultMessage="Title"
                description="Label for the title input when renaming a list"
                id="savedSearchActions.title"
              />
            }
            variant="outlined"
            onChange={(e) => { setNewTitle(e.target.value); }}
          />
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
        isSaving={saving}
        open={showEditDialog}
        proceedDisabled={!newTitle && !savedSearch.title}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
            id="savedSearchActions.renameType"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Rename list"
            description="'Rename' here is an infinitive verb"
            id="savedSearchActions.renameType"
          />
        }
        onCancel={handleClose}
        onProceed={handleUpdate}
      />

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        body={
          <p className="typography-body1">
            {
              savedSearch?.is_part_of_feeds ?
                <>
                  <FormattedHTMLMessage
                    defaultMessage="Are you sure? This is shared among all users of <strong>{teamName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                    description="A message that appears when a user tries to delete a list, warning them that it will affect other users in their workspace."
                    id="savedSearchActions.deleteMessageWarning"
                    tagName="p"
                    values={{
                      teamName: savedSearch?.team ? savedSearch.team.name : '',
                    }}
                  />
                  <Alert
                    content={
                      <ul className="bulleted-list">
                        {savedSearch?.feeds?.edges.map(feed => (
                          <li key={feed.node.id}>{feed.node.name}</li>
                        ))}
                      </ul>
                    }
                    title={
                      <FormattedHTMLMessage
                        defaultMessage="<strong>Deleting list will result in no content for the following shared feeds:</strong>"
                        description="Warning displayed on edit feed page when no list is selected."
                        id="saveFeed.deleteCustomListWarning"
                      />
                    }
                    variant="warning"
                  />
                </>
                :
                <FormattedHTMLMessage
                  defaultMessage="Are you sure? This is shared among all users of <strong>{teamName}</strong>. After deleting it, no user will be able to access it."
                  description="A message that appears when a user tries to delete a list, warning them that it will affect other users in their workspace."
                  id="savedSearchActions.deleteMessage"
                  tagName="p"
                  values={{
                    teamName: savedSearch?.team ? savedSearch.team.name : '',
                  }}
                />
            }
          </p>
        }
        cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
        isSaving={saving}
        open={showDeleteDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Delete list"
            description="'Delete' here is an infinitive verb"
            id="savedSearchActions.deleteType"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Delete list?"
            description="'Delete' here is an infinitive verb"
            id="savedSearchActions.deleteTitleType"
          />
        }
        onCancel={handleClose}
        onProceed={handleDelete}
      />
    </Can>
  );
};

SavedSearchActions.propTypes = {
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    privacy: PropTypes.number,
    team: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      permissions: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default withSetFlashMessage(injectIntl(SavedSearchActions));
