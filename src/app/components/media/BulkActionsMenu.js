/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MediasLoading from './MediasLoading';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import BulkActionsAssign from './BulkActionsAssign';
import BulkActionsStatus from './BulkActionsStatus';
import BulkActionsTag from './BulkActionsTag';
import BulkActionsRemoveTag from './BulkActionsRemoveTag';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const BulkActionsMenu = ({
  selectedMedia,
  selectedProjectMedia,
  team,
  page,
  setFlashMessage,
  onUnselectAll,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mode, setMode] = React.useState('menu');

  const handleClose = () => {
    setAnchorEl(null);
    setMode('menu');
  };
  const handleMenuTag = () => setMode('tag');
  const handleMenuRemoveTag = () => setMode('untag');
  const handleMenuAssign = () => setMode('assign');
  const handleMenuChangeStatus = () => setMode('status');

  const fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message, 'error');
  };

  const handleRestoreOrConfirm = (params) => {
    const onSuccess = () => {
      const message = page === 'trash' ? (
        <FormattedMessage
          id="bulkActions.movedRestoreSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Trash to 'All'"
          values={{
            count: selectedMedia?.length,
          }}
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
        />
      ) : (
        <FormattedMessage
          id="bulkActions.movedFromSpamSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Spam to 'All'"
          values={{
            count: selectedMedia?.length,
          }}
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
        />
      );
      setFlashMessage(message, 'success');
      onUnselectAll();
    };

    if (selectedMedia.length) {
      Relay.Store.commitUpdate(
        new BulkRestoreProjectMediaMutation({
          ids: selectedMedia,
          team,
          archived_was: params.archived_was,
        }),
        { onSuccess, onFailure: fail },
      );
    }
  };

  const handleArchive = (archived) => {
    const onSuccess = () => {
      const message = archived === CheckArchivedFlags.TRASHED ? (
        <FormattedMessage
          id="bulkActions.moveToTrashSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Trash."
          values={{
            count: selectedMedia?.length,
          }}
          description="Message that appears when one or more items have been selected and moved to the trash."
        />
      ) : (
        <FormattedMessage
          id="bulkActions.moveToSpamSuccessfully"
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Spam."
          values={{
            count: selectedMedia?.length,
          }}
          description="Message that appears when one or more items have been selected and moved to spam."
        />
      );
      setFlashMessage(message, 'success');
      onUnselectAll();
    };

    if (selectedMedia.length) {
      const mutation = new BulkArchiveProjectMediaMutation({
        ids: selectedMedia,
        team,
        archived,
      });
      Relay.Store.commitUpdate(mutation, { onSuccess });
    }
  };

  const handleMarkAsRead = (read) => {
    const onSuccess = () => {
      const message = read ? (
        <FormattedMessage
          id="bulkActions.markAsReadSuccess"
          defaultMessage="{count, plural, one {# item} other {# items}} marked as read successfully."
          values={{ count: selectedMedia?.length }}
          description="Message that appears when one or more items have been marked as read."
        />
      ) : (
        <FormattedMessage
          id="bulkActions.markAsUnreadSuccess"
          defaultMessage="{count, plural, one {# item} other {# items}} marked as unread successfully."
          values={{ count: selectedMedia?.length }}
          description="Message that appears when one or more items have been marked as unread."
        />
      );
      setFlashMessage(message, 'success');
      onUnselectAll();
    };

    if (selectedMedia.length) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation BulkActionsMenuMarkAsReadMutation($input: BulkProjectMediaMarkReadInput!) {
            bulkProjectMediaMarkRead(input: $input) {
              updated_objects {
                id
                is_read
              }
            }
          }
        `,
        variables: {
          input: {
            ids: selectedMedia,
            read,
          },
        },
        onCompleted: ({ response, error }) => {
          if (error) {
            return fail(error);
          }
          return onSuccess(response);
        },
        onError: fail,
      });
    }
  };


  const menuContent = page !== 'trash' && page !== 'spam' ? {
    menu: (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__assign" onClick={handleMenuAssign}>
          <FormattedMessage
            id="bulkActionsMenu.assign"
            defaultMessage="Assign"
            description="Menu option for bulk assigning selected items"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__mark-read" onClick={() => handleMarkAsRead(true)}>
          <FormattedMessage
            id="bulkActions.markAsRead"
            defaultMessage="Mark as read"
            description="Menu option for bulk marking selected items as read"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__mark-not-read" onClick={() => handleMarkAsRead(false)}>
          <FormattedMessage
            id="bulkActions.markAsNotRead"
            defaultMessage="Mark as unread"
            description="Menu option for bulk marking selected items as unread"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__change-status" onClick={handleMenuChangeStatus}>
          <FormattedMessage
            id="bulkActionsMenu.changeStatus"
            defaultMessage="Change status"
            description="Menu option for bulk changing statuses of selected items"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__add-tag" onClick={handleMenuTag}>
          <FormattedMessage
            id="bulkActionsMenu.addTag"
            defaultMessage="Add tag"
            description="Menu option for bulk tagging selected items"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__remove-tag" onClick={handleMenuRemoveTag}>
          <FormattedMessage
            id="bulkActionsMenu.removeTag"
            defaultMessage="Remove tag"
            description="Menu option for bulk untagging selected items"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__archive" onClick={() => handleArchive(CheckArchivedFlags.TRASHED)}>
          <FormattedMessage
            id="bulkActions.sendItemsToTrash"
            defaultMessage="Send to trash"
            description="Label for button that sends one or more items to Trash"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__archive" onClick={() => handleArchive(CheckArchivedFlags.SPAM)}>
          <FormattedMessage
            id="bulkActions.sendItemsToSpam"
            defaultMessage="Mark as spam"
            description="Label for button that sends one or more items to Spam"
          />
        </MenuItem>
      </React.Fragment>
    ),
    tag: (
      <BulkActionsTag
        onDismiss={handleClose}
        selectedMedia={selectedProjectMedia.map(pm => pm.dbid)}
        team={team}
      />
    ),
    untag: (
      <BulkActionsRemoveTag
        onDismiss={handleClose}
        selectedMedia={selectedMedia}
        team={team}
      />
    ),
    assign: (
      <BulkActionsAssign
        onDismiss={handleClose}
        selectedMedia={selectedMedia}
        team={team}
      />
    ),
    status: (
      <BulkActionsStatus
        onDismiss={handleClose}
        selectedMedia={selectedMedia}
        selectedProjectMedia={selectedProjectMedia}
        team={team}
      />
    ),
  } : {
    menu: page === 'spam' ? (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__restore" onClick={() => handleRestoreOrConfirm({ archived_was: CheckArchivedFlags.SPAM })}>
          <FormattedMessage id="bulkActions.notSpam" defaultMessage="Not spam" description="Label for button that removes one or more items from Spam and puts them back in the normal workspace" />
        </MenuItem>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__restore" onClick={() => handleRestoreOrConfirm({ archived_was: CheckArchivedFlags.TRASHED })}>
          <FormattedMessage id="bulkActions.restore" defaultMessage="Restore from trash" description="Label for button that removes one or more items from Trash and puts it back in the normal workspace" />
        </MenuItem>
      </React.Fragment>
    ),
  };

  return (
    <React.Fragment>
      <ButtonMain
        theme="brand"
        variant="contained"
        size="small"
        onClick={e => setAnchorEl(e.currentTarget)}
        iconRight={<KeyboardArrowDownIcon />}
        buttonProps={{
          id: 'bulk-actions-menu__button',
        }}
        label={
          <FormattedMessage
            id="bulkActionsMenu.action"
            defaultMessage="Action"
            description="Button for popping the actions menu. User has to pick which action to perform upon currently selected items."
          />
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuContent[mode]}
      </Menu>
    </React.Fragment>
  );
};

BulkActionsMenu.propTypes = {
  team: PropTypes.object.isRequired,
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  selectedMedia: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  selectedProjectMedia: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUnselectAll: PropTypes.func.isRequired,
};

const BulkActionsMenuRenderer = (parentProps) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  // Not in a team context
  if (teamSlug === 'check') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query BulkActionsMenuRendererQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            dbid
            name
            projects(first: 10000) {
              edges {
                node {
                  dbid
                }
              }
            }
            ...BulkActionsAssign_team
            ...BulkActionsStatus_team
            ...BulkActionsTag_team
            ...BulkActionsRemoveTag_team
            check_search_trash {
              id
              number_of_results
            }
            check_search_spam {
              id
              number_of_results
            }
            public_team {
              id
              trash_count
              spam_count
            }
            search_id
          }
        }
      `}
      cacheConfig={{ force: true }}
      variables={{
        teamSlug,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <BulkActionsMenu {...parentProps} {...props} />
          );
        }
        return <MediasLoading theme="grey" variant="icon" size="icon" />;
      }}
    />
  );
};

export default BulkActionsMenuRenderer;
