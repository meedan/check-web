/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { units } from '../../styles/js/shared';

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
  itemProjectDbid,
  showManualOrAutoOptions,
  title,
  cancelLabel,
  submitLabel,
  submitButtonClassName,
  onCancel,
  onSubmit,
}) {
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

  // Get Item folder
  let itemFolder = null;
  if (showManualOrAutoOptions) {
    itemFolder = projects.filter(({ dbid }) => dbid === itemProjectDbid);
  }
  const [userInput, setUserInput] = React.useState('ITEM_FOLDER');
  const [disableSelection, setDisableSelection] = React.useState(showManualOrAutoOptions);
  const [value, setValue] = React.useState(itemFolder);
  const handleSubmit = React.useCallback(() => {
    setValue(null);
    onSubmit(value);
  }, [onSubmit, value]);

  const handleChange = React.useCallback((ev, newValue, reason) => {
    switch (reason) {
    case 'select-option': setValue(newValue); break;
    case 'clear': setValue(null); break;
    default: break;
    }
  }, [value]);

  const handleSetFolderOptions = (optionValue) => {
    setUserInput(optionValue);
    const isDisabled = optionValue === 'ITEM_FOLDER'
    isDisabled ? setValue(itemFolder) : setValue(null);
    setDisableSelection(isDisabled);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={filteredProjects}
          autoHighlight
          value={value}
          onChange={handleChange}
          disabled={disableSelection}
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
        { showManualOrAutoOptions ?
            <Box p={units(2)} >
              <RadioGroup
                name="controlled-radio-buttons-group"
                value={userInput}
                onChange={(e) => { handleSetFolderOptions(e.target.value); }}
              >
                <FormControlLabel
                  value="ITEM_FOLDER"
                  control={<Radio />}
                  label={<FormattedMessage id="destinationProjects.itemFolder" defaultMessage="Content for report" />}
                />
                <FormControlLabel
                  value="MANUAL"
                  control={<Radio />}
                  label={<FormattedMessage id="destinationProjects.addManually" defaultMessage="Manually added content" />}
                />
              </RadioGroup>
            </Box> : null }
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

SelectProjectDialog.defaultProps = {
  excludeProjectDbids: [],
};

SelectProjectDialog.propTypes = {
  intl: intlShape.isRequired,
  open: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number.isRequired),
  title: PropTypes.node.isRequired, // title (<FormattedMessage>)
  cancelLabel: PropTypes.node.isRequired,
  submitLabel: PropTypes.node.isRequired,
  submitButtonClassName: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
};

const SelectProjectDialogRenderer = (parentProps) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  // Not in a team context
  if (teamSlug === 'check') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SelectProjectDialogRendererQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            dbid
            name
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
            project_groups(first: 10000) {
              edges {
                node {
                  dbid
                  title
                }
              }
            }
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
            <SelectProjectDialog {...parentProps} {...props} />
          );
        }
        return null;
      }}
    />
  );
};

export default injectIntl(SelectProjectDialogRenderer);
