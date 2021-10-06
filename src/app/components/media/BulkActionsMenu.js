import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
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

  const menuContent = {
    menu: (
      <React.Fragment>
        <MenuItem className="bulk-actions-menu__move" onClick={handleMenuMove}>
          <FormattedMessage
            id="bulkActionsMenu.moveToFolder"
            defaultMessage="Move to folder"
            description=""
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__tag" onClick={handleMenuTag}>
          <FormattedMessage
            id="bulkActionsMenu.tag"
            defaultMessage="Tag"
            description=""
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__assign" onClick={handleMenuAssign}>
          <FormattedMessage
            id="bulkActionsMenu.assign"
            defaultMessage="Assign"
            description=""
          />
        </MenuItem>
        <MenuItem className="bulk-actions-menu__change-status" onClick={handleMenuChangeStatus}>
          <FormattedMessage
            id="bulkActionsMenu.changeStatus"
            defaultMessage="Change status"
            description=""
          />
        </MenuItem>
      </React.Fragment>
    ),
    move: (
      <BulkActionsMove
        excludeProjectDbids={excludeProjectDbids}
        onDismiss={handleClose}
        onSubmit={onMove}
        selectedMedia={selectedMedia}
        team={team}
      />
    ),
    tag: (
      <BulkActionsTag team={team} />
    ),
    assign: (
      <BulkActionsAssign team={team} />
    ),
    status: (
      <BulkActionsStatus team={team} />
    ),
  };

  return (
    <React.Fragment>
      <Button
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
  onMove: PropTypes.func.isRequired,
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
        return null;
      }}
    />
  );
};

export default BulkActionsMenuRenderer;
