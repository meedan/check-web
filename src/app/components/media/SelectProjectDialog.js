import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

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

  const filteredProjects = team.projects.edges
    .map(({ node }) => node)
    .filter(({ dbid }) => !excludeProjectDbids.includes(dbid));

  const handleChange = React.useCallback((ev, newValue, reason) => {
    switch (reason) {
    case 'select-option': setValue(newValue); break;
    case 'clear': setValue(null); break;
    default: break;
    }
  }, [value]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={filteredProjects}
          autoHighlight
          value={value}
          onChange={handleChange}
          getOptionLabel={option => option.title}
          getOptionSelected={(option, val) => val !== null && option.id === val.id}
          groupBy={() => team.name /* show team name on top of all options */}
          renderInput={params => (
            <TextField
              {...params}
              autoFocus
              name="project-title"
              label={
                <FormattedMessage id="destinationProjects.choose" defaultMessage="Choose a folder" />
              }
              variant="outlined"
            />
          )}
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
      name
      projects(first: 10000) {
        edges {
          node {
            id
            dbid
            title
            medias_count  # For optimistic updates when adding/moving items
            search_id  # For optimistic updates when adding/moving items
          }
        }
      }
    }
  `,
});
