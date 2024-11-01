/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import BulkActionsAssign from './BulkActionsAssign';
import BulkActionsStatus from './BulkActionsStatus';
import BulkActionsTag from './BulkActionsTag';
import BulkActionsRemoveTag from './BulkActionsRemoveTag';
import Loader from '../cds/loading/Loader';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Can from '../Can';
import { FlashMessageSetterContext } from '../FlashMessage';
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
import BulkRestoreProjectMediaMutation from '../../relay/mutations/BulkRestoreProjectMediaMutation';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const BulkActionsMenu = ({
  onUnselectAll,
  page,
  selectedMedia,
  selectedProjectMedia,
  team,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mode, setMode] = React.useState('menu');
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

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
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Trash to 'All'"
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
          id="bulkActions.movedRestoreSuccessfully"
          values={{
            count: selectedMedia?.length,
          }}
        />
      ) : (
        <FormattedMessage
          defaultMessage="{count, plural, one {# item} other {# items}} moved from Spam to 'All'"
          description="Banner displayed after items are moved successfully. 'All' here is the name of the default view in the workspace, which is localized under the id projectsComponent.allItems"
          id="bulkActions.movedFromSpamSuccessfully"
          values={{
            count: selectedMedia?.length,
          }}
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
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Trash."
          description="Message that appears when one or more items have been selected and moved to the trash."
          id="bulkActions.moveToTrashSuccessfully"
          values={{
            count: selectedMedia?.length,
          }}
        />
      ) : (
        <FormattedMessage
          defaultMessage="{count, plural, one {# item} other {# items}} moved to Spam."
          description="Message that appears when one or more items have been selected and moved to spam."
          id="bulkActions.moveToSpamSuccessfully"
          values={{
            count: selectedMedia?.length,
          }}
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
          defaultMessage="{count, plural, one {# item} other {# items}} marked as read successfully."
          description="Message that appears when one or more items have been marked as read."
          id="bulkActions.markAsReadSuccess"
          values={{ count: selectedMedia?.length }}
        />
      ) : (
        <FormattedMessage
          defaultMessage="{count, plural, one {# item} other {# items}} marked as unread successfully."
          description="Message that appears when one or more items have been marked as unread."
          id="bulkActions.markAsUnreadSuccess"
          values={{ count: selectedMedia?.length }}
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
        onCompleted: ({ error, response }) => {
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
            defaultMessage="Assign"
            description="Menu option for bulk assigning selected items"
            id="bulkActionsMenu.assign"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__mark-read" onClick={() => handleMarkAsRead(true)}>
          <FormattedMessage
            defaultMessage="Mark as read"
            description="Menu option for bulk marking selected items as read"
            id="bulkActions.markAsRead"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__mark-not-read" onClick={() => handleMarkAsRead(false)}>
          <FormattedMessage
            defaultMessage="Mark as unread"
            description="Menu option for bulk marking selected items as unread"
            id="bulkActions.markAsNotRead"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__change-status" onClick={handleMenuChangeStatus}>
          <FormattedMessage
            defaultMessage="Change status"
            description="Menu option for bulk changing statuses of selected items"
            id="bulkActionsMenu.changeStatus"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__add-tag" onClick={handleMenuTag}>
          <FormattedMessage
            defaultMessage="Add tag"
            description="Menu option for bulk tagging selected items"
            id="bulkActionsMenu.addTag"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__remove-tag" onClick={handleMenuRemoveTag}>
          <FormattedMessage
            defaultMessage="Remove tag"
            description="Menu option for bulk untagging selected items"
            id="bulkActionsMenu.removeTag"
          />
        </MenuItem>
        <hr />
        <MenuItem className="bulk-actions-menu__archive" onClick={() => handleArchive(CheckArchivedFlags.TRASHED)}>
          <FormattedMessage
            defaultMessage="Send to trash"
            description="Label for button that sends one or more items to Trash"
            id="bulkActions.sendItemsToTrash"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__archive" onClick={() => handleArchive(CheckArchivedFlags.SPAM)}>
          <FormattedMessage
            defaultMessage="Mark as spam"
            description="Label for button that sends one or more items to Spam"
            id="bulkActions.sendItemsToSpam"
          />
        </MenuItem>
      </React.Fragment>
    ),
    tag: (
      <BulkActionsTag
        selectedMedia={selectedProjectMedia.map(pm => pm.dbid)}
        team={team}
        onDismiss={handleClose}
      />
    ),
    untag: (
      <BulkActionsRemoveTag
        selectedMedia={selectedMedia}
        team={team}
        onDismiss={handleClose}
      />
    ),
    assign: (
      <BulkActionsAssign
        selectedMedia={selectedMedia}
        team={team}
        onDismiss={handleClose}
      />
    ),
    status: (
      <BulkActionsStatus
        selectedMedia={selectedMedia}
        selectedProjectMedia={selectedProjectMedia}
        team={team}
        onDismiss={handleClose}
      />
    ),
  } : {
    menu: page === 'spam' ? (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__restore" onClick={() => handleRestoreOrConfirm({ archived_was: CheckArchivedFlags.SPAM })}>
          <FormattedMessage defaultMessage="Not spam" description="Label for button that removes one or more items from Spam and puts them back in the normal workspace" id="bulkActions.notSpam" />
        </MenuItem>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__restore" onClick={() => handleRestoreOrConfirm({ archived_was: CheckArchivedFlags.TRASHED })}>
          <FormattedMessage defaultMessage="Restore from trash" description="Label for button that removes one or more items from Trash and puts it back in the normal workspace" id="bulkActions.restore" />
        </MenuItem>
      </React.Fragment>
    ),
  };

  return (
    <span id="media-bulk-actions">
      <Can permission="bulk_update ProjectMedia" permissions={team.permissions}>
        <ButtonMain
          buttonProps={{
            id: 'bulk-actions-menu__button',
          }}
          iconRight={<KeyboardArrowDownIcon />}
          label={
            <FormattedMessage
              defaultMessage="Bulk Change [{count}]"
              description="Button for popping the actions menu. User has to pick which action to perform upon currently selected items."
              id="bulkActionsMenu.action"
              values={{
                count: selectedMedia?.length,
              }}
            />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={e => setAnchorEl(e.currentTarget)}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {menuContent[mode]}
        </Menu>
      </Can>
    </span>
  );
};

BulkActionsMenu.propTypes = {
  team: PropTypes.object.isRequired,
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  selectedMedia: PropTypes.arrayOf(PropTypes.string).isRequired,
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
      cacheConfig={{ force: true }}
      environment={Relay.Store}
      query={graphql`
        query BulkActionsMenuRendererQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            dbid
            name
            permissions
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
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <BulkActionsMenu {...parentProps} {...props} />
          );
        }
        return <Loader size="icon" theme="grey" variant="icon" />;
      }}
      variables={{
        teamSlug,
      }}
    />
  );
};

export default BulkActionsMenuRenderer;
