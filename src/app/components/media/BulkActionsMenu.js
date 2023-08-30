/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Divider from '@material-ui/core/Divider';
import BulkActionsAssign from './BulkActionsAssign';
import BulkActionsStatus from './BulkActionsStatus';
import BulkActionsTag from './BulkActionsTag';
import BulkActionsRemoveTag from './BulkActionsRemoveTag';

const BulkActionsMenu = ({
  selectedMedia,
  selectedProjectMedia,
  team,
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

  const menuContent = {
    menu: (
      <React.Fragment>
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
        <Divider />
        <MenuItem className="bulk-actions-menu__assign" onClick={handleMenuAssign}>
          <FormattedMessage
            id="bulkActionsMenu.assign"
            defaultMessage="Assign"
            description="Menu option for bulk assigning selected items"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__change-status" onClick={handleMenuChangeStatus}>
          <FormattedMessage
            id="bulkActionsMenu.changeStatus"
            defaultMessage="Change status"
            description="Menu option for bulk changing statuses of selected items"
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
  };

  return (
    <React.Fragment>
      <Button
        id="bulk-actions-menu__button"
        color="primary"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <FormattedMessage
          id="bulkActionsMenu.action"
          defaultMessage="Action"
          description="Button for popping the actions menu. User has to pick which action to perform upon currently selected items."
        />
      </Button>
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
  selectedMedia: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedProjectMedia: PropTypes.arrayOf(PropTypes.object).isRequired,
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
        return <CircularProgress size={30} />;
      }}
    />
  );
};

export default BulkActionsMenuRenderer;
