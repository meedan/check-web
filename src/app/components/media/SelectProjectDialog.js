import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const messages = defineMessages({
  notInAnyCollection: {
    id: 'destinationProjects.none',
    defaultMessage: 'Not in any collection',
    description: 'Label used for folders that are not in any collection',
  },
  noFolders: {
    id: 'destinationProjects.empty',
    defaultMessage: 'No folders in this collection',
  },
});

function SelectProjectDialog({
  intl,
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

  // Collections
  const projectGroups = team.project_groups.edges.map(({ node }) => node);

  // Fill in the collection title for each folder, even if "not in any collection"
  const projects = team.projects.edges
    .map(({ node }) => {
      const projectGroup = projectGroups.find(pg => pg.dbid === node.project_group_id) ||
                           { title: intl.formatMessage(messages.notInAnyCollection) };
      return { ...node, projectGroupTitle: projectGroup.title };
    });

  // Add "empty folders" to empty collections, so they appear in the drop-down as well
  projectGroups.forEach((pg) => {
    if (!projects.find(p => p.project_group_id === pg.dbid)) {
      projects.push({ projectGroupTitle: pg.title, title: intl.formatMessage(messages.noFolders) });
    }
  });

  // Lastly, sort options by collection title and exclude some options
  const filteredProjects = projects
    .filter(({ dbid }) => !excludeProjectDbids.includes(dbid))
    .sort((a, b) => a.projectGroupTitle.localeCompare(b.projectGroupTitle));

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
          getOptionDisabled={option => !option.dbid}
          groupBy={option => option.projectGroupTitle}
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
  intl: intlShape.isRequired,
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

export default createFragmentContainer(injectIntl(SelectProjectDialog), {
  team: graphql`
    fragment SelectProjectDialog_team on Team {
      name
      project_groups(first: 10000) {
        edges {
          node {
            dbid
            title
          }
        }
      }
      projects(first: 10000) {
        edges {
          node {
            id
            dbid
            title
            project_group_id
            medias_count  # For optimistic updates when adding/moving items
            search_id  # For optimistic updates when adding/moving items
          }
        }
      }
    }
  `,
});
