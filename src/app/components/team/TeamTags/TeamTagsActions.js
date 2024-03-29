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
  tag,
  teamId,
  teamDbid,
  rules,
  rulesSchema,
  setFlashMessage,
  relay,
  pageSize,
  intl,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamTagsActions.couldNotDelete"
        defaultMessage="Could not delete tag"
        description="Error message displayed when it's not possible to delete a team tag"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamTagsActions.deletedSuccessfully"
        defaultMessage="Tag deleted successfully"
        description="Message displayed when a team tag is deleted"
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
        variant="outlined"
        size="default"
        theme="text"
        onClick={e => setAnchorEl(e.currentTarget)}
        title={intl.formatMessage(messages.tooltip)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="team-tags-actions__edit" onClick={() => { setAnchorEl(null); setShowEditDialog(true); }}>
          <FormattedMessage
            id="teamTagsActions.edit"
            defaultMessage="Edit"
            description="Menu item to edit a tag"
          />
        </MenuItem>
        <MenuItem className="team-tags-actions__destroy" onClick={() => { setAnchorEl(null); setShowDeleteDialog(true); }}>
          <FormattedMessage
            id="teamTagsActions.delete"
            defaultMessage="Delete"
            description="Menu item to delete a tag"
          />
        </MenuItem>
      </Menu>
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          <FormattedMessage
            id="teamTagsActions.removeDialogTitle"
            defaultMessage='Delete tag "{tag}"'
            description="Title for the dialog box when deleting a tag"
            values={{ tag: tag.text }}
          />
        }
        body={
          <FormattedMessage
            id="teamTagsActions.removeDialogBody"
            defaultMessage='Tag "{tag}" will be removed from {count} items.'
            description="Description of what will happen when a tag is deleted"
            values={{ tag: tag.text, count: tag.tags_count }}
          />
        }
        onCancel={() => { setShowDeleteDialog(false); }}
        onProceed={handleDelete}
        proceedDisabled={saving}
        proceedLabel={
          <FormattedMessage
            id="teamTagsActions.remove"
            description="Dialog action text for continuing with the delete tag action"
            defaultMessage="Delete tag"
          />
        }
      />
      { showEditDialog ?
        <SaveTag
          tag={tag}
          teamId={teamId}
          teamDbid={teamDbid}
          rules={rules}
          rulesSchema={rulesSchema}
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
