import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SaveTag from './SaveTag';
import { withSetFlashMessage } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const TeamTagsActions = ({
  tag,
  teamId,
  teamDbid,
  rules,
  rulesSchema,
  setFlashMessage,
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
              tag_texts(first: 10000) {
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
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <React.Fragment>
      <IconButton
        tooltip={<FormattedMessage id="teamTagsActions.tooltip" defaultMessage="Manage tag" />}
        onClick={e => setAnchorEl(e.currentTarget)}
        style={{ padding: 0 }}
        className="team-tags-actions__icon"
      >
        <IconMoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="team-tags-actions__edit" onClick={() => { setAnchorEl(null); setShowEditDialog(true); }}>
          <FormattedMessage
            id="teamTagsActions.edit"
            defaultMessage="Edit"
          />
        </MenuItem>
        <MenuItem className="team-tags-actions__destroy" onClick={() => { setAnchorEl(null); setShowDeleteDialog(true); }}>
          <FormattedMessage
            id="teamTagsActions.delete"
            defaultMessage="Delete"
          />
        </MenuItem>
      </Menu>
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          <FormattedMessage
            id="teamTagsActions.removeDialogTitle"
            defaultMessage='Delete tag "{tag}"'
            values={{ tag: tag.text }}
          />
        }
        body={
          <FormattedMessage
            id="teamTagsActions.removeDialogBody"
            defaultMessage='Tag "{tag}" will be removed from {count} items.'
            values={{ tag: tag.text, count: tag.tags_count }}
          />
        }
        onCancel={() => { setShowDeleteDialog(false); }}
        onProceed={handleDelete}
        proceedDisabled={saving}
        proceedLabel={
          <FormattedMessage
            id="teamTagsActions.remove"
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
};

export default withSetFlashMessage(TeamTagsActions);
