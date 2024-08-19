/* eslint-disable react/sort-prop-types */
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Can from '../Can';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronDownIcon from '../../icons/chevron_down.svg';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import styles from './SaveFeed.module.css';

const FeedActions = ({
  feedTeam,
  handleDelete,
  handleLeaveFeed,
  saving,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const { feed } = feedTeam;
  const isFeedOwner = feedTeam.team_id === feed.team.dbid;

  const permissionRequired = isFeedOwner ? 'destroy Feed' : 'destroy FeedTeam';
  const mergedPermissions = { ...JSON.parse(feed?.permissions), ...JSON.parse(feedTeam.permissions) };

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
          defaultMessage="Leave shared feed"
          description="Menu option to leave the selected shared feed"
          id="SaveFeed.leaveButton"
        />
      </MenuItem>
    );
  } else if (feed.teams_count > 1 || feed.feed_invitations.edges.find(invitation => invitation.node.state === 'invited')) {
    menuItem = (
      <MenuItem disabled>
        <FormattedHTMLMessage
          defaultMessage="Delete shared feed <br />(Remove collaborators to <br /> delete this shared feed)"
          description="Menu option to inform user to remove collaborators before deleting the selected shared feed"
          id="SaveFeed.deleteButtonDisabled"
        />
      </MenuItem>
    );
  } else {
    menuItem = (
      <MenuItem onClick={handleDeleteClick}>
        <FormattedMessage
          defaultMessage="Delete shared feed"
          description="Menu option to delete the selected shared feed"
          id="SaveFeed.deleteButton"
        />
      </MenuItem>
    );
  }

  return (
    <>
      <Can permission={permissionRequired} permissions={JSON.stringify(mergedPermissions)}>
        <ButtonMain
          className={`typography-button ${styles.saveFeedButtonMoreActions}`}
          iconRight={<ChevronDownIcon />}
          label={
            <FormattedMessage
              defaultMessage="More Actions"
              description="Label to the save button of the shared feed update form"
              id="saveFeed.MoreActionsButton"
            />
          }
          size="default"
          theme="text"
          variant="outlined"
          onClick={handleMenuClick}
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
        body={
          feed.saved_search_id ? (
            <>
              <FormattedHTMLMessage
                defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                description="Confirmation dialog message when deleting a feed."
                id="saveFeed.deleteSharedFeedConfirmationDialogWaningBody"
                values={{
                  orgName: feed.team?.name,
                }}
              />
              <Alert
                content={
                  <ul className="bulleted-list">
                    <li>{feed.saved_search.title}</li>
                  </ul>
                }
                title={
                  <FormattedHTMLMessage
                    defaultMessage="<strong>Note: Your custom list and items will remain available and unaffected.</strong>"
                    description="Warning displayed on edit feed page when no list is selected."
                    id="saveFeed.deleteSharedFeedWarning"
                  />
                }
                variant="warning"
              />
            </>
          ) : (
            <FormattedHTMLMessage
              defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />Note: Deleting this shared feed will not remove any items or list from your workspace."
              description="Confirmation dialog message when deleting a feed."
              id="saveFeed.deleteSharedFeedConfirmationDialogBody"
              values={{
                orgName: feed.team?.name,
              }}
            />
          )
        }
        cancelLabel={
          <FormattedMessage
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
            id="global.cancel"
          />
        }
        isSaving={saving}
        open={showDeleteDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Delete Shared Feed"
            description="'Delete' here is an infinitive verb"
            id="saveFeed.deleteSharedFeedConfirmationButton"
          />
        }
        title={
          feed.saved_search_id ? (
            <FormattedMessage
              defaultMessage="Are you sure you want to delete this shared feed?"
              description="'Delete' here is an infinitive verb"
              id="saveFeed.deleteSharedFeedWarningTitle"
            />
          ) : (
            <FormattedMessage
              defaultMessage="Delete Shared Feed?"
              description="'Delete' here is an infinitive verb"
              id="saveFeed.deleteSharedFeedTitle"
            />
          )
        }
        onCancel={handleClose}
        onProceed={handleDelete}
      />

      {/* "Leave" dialog */}
      <ConfirmProceedDialog
        body={
          <FormattedHTMLMessage
            defaultMessage="Are you sure? Any content you are currently sharing with this feed will no longer be accessible by collaborating organizations.<br /><br />You will need to contact <strong>{orgName}</strong> in order to rejoin."
            description="Confirmation dialog message when leaving a feed.."
            id="saveFeed.leaveFeedConfirmationBod"
            values={{
              orgName: feed.team?.name,
            }}
          />
        }
        cancelLabel={
          <FormattedMessage
            defaultMessage="Cancel"
            description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
            id="global.cancel"
          />
        }
        isSaving={saving}
        open={showLeaveDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Leave Feed"
            description="'Leave' here is an infinitive verb"
            id="saveFeed.leaveFeedConfirmationButton"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Leave Shared Feed?"
            description="'Leave' here is an infinitive verb"
            id="saveFeed.leaveFeedWarningTitle"
          />
        }
        onCancel={handleClose}
        onProceed={handleLeaveFeed}
      />
    </>
  );
};

FeedActions.propTypes = {
  saving: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleLeaveFeed: PropTypes.func.isRequired,
  feedTeam: PropTypes.shape({
    team_id: PropTypes.number.isRequired,
    feed: PropTypes.shape({
      permissions: PropTypes.string.isRequired,
      saved_search_id: PropTypes.number.isRequired,
      saved_search: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }).isRequired,
      teams_count: PropTypes.number.isRequired,
      team: PropTypes.shape({
        name: PropTypes.string.isRequired,
        dbid: PropTypes.number.isRequired,
      }).isRequired,
      feed_invitations: PropTypes.shape({
        edges: PropTypes.arrayOf(PropTypes.shape({
          node: PropTypes.shape({
            state: PropTypes.string.isRequired,
          }),
        })).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(FeedActions, graphql`
  fragment FeedActions_feedTeam on FeedTeam {
    team_id
    permissions
    feed {
      permissions
      saved_search_id
      saved_search {
        title
      }
      teams_count
      feed_invitations(first: 100) {
        edges {
          node {
            state
          }
        }
      }
      team {
        name
        dbid
      }
    }
  }
`);
