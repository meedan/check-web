import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DestinationProjects from './DestinationProjects';

function SelectProjectDialog({
  open,
  team,
  excludeProjectDbids,
  title,
  cancelLabel,
  submitLabel,
  submitButtonClassName,
  onCancel,
  onSubmit,
}) {
  const [value, setValue] = React.useState(null);
  const handleSubmit = React.useCallback(() => {
    setValue(null);
    onSubmit(value);
  }, [onSubmit, value]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DestinationProjects
          team={team}
          excludeProjectDbids={excludeProjectDbids}
          value={value}
          onChange={setValue}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>{cancelLabel}</Button>
        <Button
          color="primary"
          className={submitButtonClassName}
          onClick={handleSubmit}
          disabled={!value}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
SelectProjectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  title: PropTypes.node.isRequired, // title (<FormattedMessage>)
  cancelLabel: PropTypes.node.isRequired,
  submitLabel: PropTypes.node.isRequired,
  submitButtonClassName: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
};

export default createFragmentContainer(SelectProjectDialog, {
  team: graphql`
    fragment SelectProjectDialog_team on Team {
      ...DestinationProjects_team
    }
  `,
});
