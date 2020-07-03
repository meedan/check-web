import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DestinationProjects from './DestinationProjects';

const MoveDialog = ({
  team, open, onClose, title, excludeProjectDbids, value, onChange, actions,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DestinationProjects
        team={team}
        excludeProjectDbids={excludeProjectDbids}
        value={value}
        onChange={onChange}
      />
    </DialogContent>
    <DialogActions>{actions}</DialogActions>
  </Dialog>
);
MoveDialog.defaultProps = {
  value: null,
};
MoveDialog.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  value: PropTypes.object, // GraphQL "Project" object or null
  onChange: PropTypes.func.isRequired, // func(<Project>) => undefined
  title: PropTypes.node.isRequired, // title (<FormattedMessage>)
  actions: PropTypes.node.isRequired, // buttons
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired, // func() => undefined
};

export default createFragmentContainer(MoveDialog, graphql`
  fragment MoveDialog_team on Team {
    ...DestinationProjects_team
  }
`);
