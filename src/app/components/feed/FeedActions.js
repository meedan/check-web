import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Can from '../Can';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronDownIcon from '../../icons/chevron_down.svg';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const FeedActions = ({
  permissions,
  disableSaveButton,
  saving,
  handleDelete,
  handleLeaveFeed,
  feedTeam,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const feed = feedTeam?.feed || {};
  const isFeedOwner = feedTeam.team_id === feed.team.dbid;

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleLeaveClick = () => {
    setShowLeaveDialog(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowDeleteDialog(false);
    setShowLeaveDialog(false);
  };

  let menuItem = null;

  if (!isFeedOwner) {
    menuItem = (
      <MenuItem onClick={handleLeaveClick}>
        <FormattedMessage
          id="SaveFeed.leaveButton"
          defaultMessage="Leave shared feed"
          description="Menu option to leave the selected shared feed"
        />
      </MenuItem>
    );
  } else if (feed.teams_count > 1) {
    menuItem = (
      <MenuItem disabled>
        <FormattedHTMLMessage
          permissions={feed.permissions}
          id="SaveFeed.deleteButtonDisabled"
          defaultMessage="Delete shared feed <br />(Remove collaborators to <br /> delete this shared feed)"
          description="Menu option to inform user to remove collaborators before deleting the selected shared feed"
        />
      </MenuItem>
    );
  } else {
    menuItem = (
      <MenuItem onClick={handleDeleteClick}>
        <FormattedMessage
          id="SaveFeed.deleteButton"
          defaultMessage="Delete shared feed"
          description="Menu option to delete the selected shared feed"
        />
      </MenuItem>
    );
  }

  return (
    <>
      <Can permissions={permissions} permission="destroy Feed">
        <ButtonMain
          className="typography-button ${styles.saveFeedButtonMoreActions"
          theme="text"
          size="default"
          variant="outlined"
          onClick={handleMenuClick}
          disabled={disableSaveButton}
          iconRight={<ChevronDownIcon />}
          label={
            <FormattedMessage
              id="saveFeed.MoreActionsButton"
              defaultMessage="More Actions"
              description="Label to the save button of the shared feed update form"
            />
          }
        />
      </Can>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItem}
      </Menu>

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          feed.saved_search_id ? (
            <FormattedMessage
              id="saveFeed.deleteSharedFeedWarningTitle"
              defaultMessage="Are you sure you want to delete this shared feed?"
              description="'Delete' here is an infinitive verb"
            />
          ) : (
            <FormattedMessage
              id="saveFeed.deleteSharedFeedTitle"
              defaultMessage="Delete Shared Feed?"
              description="'Delete' here is an infinitive verb"
            />
          )
        }
        body={
          feed.saved_search_id ? (
            <>
              <FormattedHTMLMessage
                id="saveFeed.deleteSharedFeedConfirmationDialogWaningBody"
                defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                values={{
                  orgName: feed.team?.name,
                }}
                description="Confirmation dialog message when deleting a feed."
              />
              <Alert
                variant="warning"
                title={
                  <FormattedHTMLMessage
                    id="saveFeed.deleteSharedFeedWarning"
                    defaultMessage="<strong>NOTE: Your custom list and items will remain available and unaffected.</strong>"
                    description="Warning displayed on edit feed page when no list is selected."
                  />
                }
                content={
                  <ul className="bulleted-list">
                    <li>{feed.saved_search.title}</li>
                  </ul>
                }
              />
            </>
          ) : (
            <FormattedHTMLMessage
              id="saveFeed.deleteSharedFeedConfirmationDialogBody"
              defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />Note: Deleting this shared feed will not remove any items or list from your workspace."
              values={{
                orgName: feed.team?.name,
              }}
              description="Confirmation dialog message when deleting a feed."
            />
          )
        }
        proceedLabel={
          <FormattedMessage
            id="saveFeed.deleteSharedFeedConfirmationButton"
            defaultMessage="Delete Shared Feed"
            description="'Delete' here is an infinitive verb"
          />
        }
        onProceed={handleDelete}
        isSaving={saving}
        cancelLabel={
          <FormattedMessage
            id="global.cancel"
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
          />
        }
        onCancel={handleClose}
      />

      {/* "Leave" dialog */}
      <ConfirmProceedDialog
        open={showLeaveDialog}
        title={
          <FormattedMessage
            id="saveFeed.leaveFeedWarningTitle"
            defaultMessage="Leave Shared Feed?"
            description="'Leave' here is an infinitive verb"
          />
        }
        body={
          <FormattedHTMLMessage
            id="saveFeed.leaveFeedConfirmationBod"
            defaultMessage="Are you sure you? Any content you are currently sharing with this feed will no longer be acessible by collaboriting organization.<br /><br />You will need to contact <strong>{orgName}</strong> in order to rejoin."
            values={{
              orgName: feed.team?.name,
            }}
            description="Confirmation dialog message when leaving a feed.."
          />
        }
        proceedLabel={
          <FormattedMessage
            id="saveFeed.leaveFeedConfirmationButton"
            defaultMessage="Leave Feed"
            description="'Leave' here is an infinitive verb"
          />
        }
        onProceed={handleLeaveFeed}
        isSaving={saving}
        cancelLabel={
          <FormattedMessage
            id="global.cancel"
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
          />
        }
        onCancel={handleClose}
      />
    </>
  );
};

FeedActions.propTypes = {
  // permissions: PropTypes.array.isRequired,
  disableSaveButton: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleLeaveFeed: PropTypes.func.isRequired,
  feedTeam: PropTypes.object.isRequired,
};

export default FeedActions;
