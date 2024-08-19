/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SaveTag from './SaveTag';
import { withSetFlashMessage } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import IconMoreVert from '../../../icons/more_vert.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';

const messages = defineMessages({
  tooltip: {
    id: 'teamTagsActions.tooltip',
    defaultMessage: 'Manage tag',
    description: 'Tooltip to call menu for actions to perform on a tag',
  },
});

const TeamTagsActions = ({
  intl,
  pageSize,
  relay,
  rules,
  rulesSchema,
  setFlashMessage,
  tag,
  teamDbid,
  teamId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Could not delete tag"
        description="Error message displayed when it's not possible to delete a team tag"
        id="teamTagsActions.couldNotDelete"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Tag deleted successfully"
        description="Message displayed when a team tag is deleted"
        id="teamTagsActions.deletedSuccessfully"
      />
    ), 'success');
    setShowDeleteDialog(false);
  };

  const handleDelete = () => {
    setSaving(true);

    commitMutation(Store, {
      mutation: graphql`
        mutation TeamTagsActionsDestroyTagTextMutation($input: DestroyTagTextInput!) {
          destroyTagText(input: $input) {
            team {
              id
              get_rules
              tag_texts(first: 100) {
                edges {
                  node {
                    id
                    text
                    tags_count
                    updated_at
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          id: tag.id,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
          // if we have updated the tags, we use refetchConnection to reset the pagination overall (since we can't figure out exactly where it should be relative to this page, anyway)
          relay.refetchConnection(pageSize);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <React.Fragment>
      <ButtonMain
        className="team-tags-actions__icon"
        iconCenter={<IconMoreVert />}
        size="default"
        theme="text"
        title={intl.formatMessage(messages.tooltip)}
        variant="outlined"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="team-tags-actions__edit" onClick={() => { setAnchorEl(null); setShowEditDialog(true); }}>
          <FormattedMessage
            defaultMessage="Edit"
            description="Menu item to edit a tag"
            id="teamTagsActions.edit"
          />
        </MenuItem>
        <MenuItem className="team-tags-actions__destroy" onClick={() => { setAnchorEl(null); setShowDeleteDialog(true); }}>
          <FormattedMessage
            defaultMessage="Delete"
            description="Menu item to delete a tag"
            id="teamTagsActions.delete"
          />
        </MenuItem>
      </Menu>
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage='Tag "{tag}" will be removed from {count} items.'
            description="Description of what will happen when a tag is deleted"
            id="teamTagsActions.removeDialogBody"
            values={{ tag: tag.text, count: tag.tags_count }}
          />
        }
        open={showDeleteDialog}
        proceedDisabled={saving}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Delete tag"
            description="Dialog action text for continuing with the delete tag action"
            id="teamTagsActions.remove"
          />
        }
        title={
          <FormattedMessage
            defaultMessage='Delete tag "{tag}"'
            description="Title for the dialog box when deleting a tag"
            id="teamTagsActions.removeDialogTitle"
            values={{ tag: tag.text }}
          />
        }
        onCancel={() => { setShowDeleteDialog(false); }}
        onProceed={handleDelete}
      />
      { showEditDialog ?
        <SaveTag
          rules={rules}
          rulesSchema={rulesSchema}
          tag={tag}
          teamDbid={teamDbid}
          teamId={teamId}
          onCancel={() => { setShowEditDialog(false); }}
        /> : null }
    </React.Fragment>
  );
};

TeamTagsActions.defaultProps = {
  rules: [],
};

TeamTagsActions.propTypes = {
  tag: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    tags_count: PropTypes.number.isRequired,
  }).isRequired,
  teamId: PropTypes.string.isRequired,
  teamDbid: PropTypes.number.isRequired,
  rules: PropTypes.arrayOf(PropTypes.object),
  rulesSchema: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default withSetFlashMessage(injectIntl(TeamTagsActions));
