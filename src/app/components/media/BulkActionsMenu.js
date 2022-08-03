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
import BulkActionsMove from './BulkActionsMove';
import BulkActionsAssign from './BulkActionsAssign';
import BulkActionsStatus from './BulkActionsStatus';
import BulkActionsTag from './BulkActionsTag';

const BulkActionsMenu = ({
  excludeProjectDbids,
  onMove,
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
  const handleMenuMove = () => setMode('move');
  const handleMenuTag = () => setMode('tag');
  const handleMenuAssign = () => setMode('assign');
  const handleMenuChangeStatus = () => setMode('status');

  const destFolders = team.projects.edges
    .filter(({ node }) => !excludeProjectDbids.includes(node.dbid));

  const menuContent = {
    menu: (
      <React.Fragment>
        <MenuItem
          className="bulk-actions-menu__move"
          onClick={handleMenuMove}
          disabled={destFolders.length === 0}
        >
          <FormattedMessage
            id="bulkActionsMenu.moveToFolder"
            defaultMessage="Move to folder"
            description="Menu option for bulk moving selected items into a folder"
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__tag" onClick={handleMenuTag}>
          <FormattedMessage
            id="bulkActionsMenu.tag"
            defaultMessage="Tag"
            description="Menu option for bulk tagging selected items"
          />
        </MenuItem>
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
    move: (
      <BulkActionsMove
        excludeProjectDbids={excludeProjectDbids}
        selectedMedia={selectedMedia}
        onDismiss={handleClose}
        onSubmit={onMove}
        team={team}
      />
    ),
    tag: (
      <BulkActionsTag
        onDismiss={handleClose}
        selectedMedia={selectedProjectMedia.map(pm => pm.dbid)}
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
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number).isRequired,
  team: PropTypes.object.isRequired,
  onMove: PropTypes.func.isRequired,
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
            ...BulkActionsMove_team
            ...BulkActionsStatus_team
            ...BulkActionsTag_team
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
