import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { FormattedMessage } from 'react-intl';
// Import mutations so we can include them in query fragments
// eslint-disable-next-line no-unused-vars
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
// eslint-disable-next-line no-unused-vars
import BulkArchiveProjectMediaMutation from '../../relay/mutations/BulkArchiveProjectMediaMutation';
// eslint-disable-next-line no-unused-vars
import BulkCreateProjectMediaProjectsMutation from '../../relay/mutations/BulkCreateProjectMediaProjectsMutation';
// eslint-disable-next-line no-unused-vars
import BulkUpdateProjectMediaProjectsMutation from '../../relay/mutations/BulkUpdateProjectMediaProjectsMutation';
// eslint-disable-next-line no-unused-vars
import BulkDeleteProjectMediaProjectsMutation from '../../relay/mutations/BulkDeleteProjectMediaProjectsMutation';

function DestinationProjects({
  team, excludeProjectDbids, value, onChange,
}) {
  const filteredProjects = team.projects.edges
    .map(({ node }) => node)
    .filter(({ dbid }) => !excludeProjectDbids.includes(dbid));

  const handleChange = React.useCallback((ev, newValue, reason) => {
    switch (reason) {
    case 'select-option': onChange(newValue); break;
    case 'clear': onChange(null); break;
    default: break;
    }
  }, [onChange]);

  // autoHighlight: makes it so user can type name and press Enter to choose list
  return (
    <Autocomplete
      options={filteredProjects}
      autoHighlight
      value={value}
      onChange={handleChange}
      getOptionLabel={({ title }) => title}
      getOptionSelected={(option, val) => val !== null && option.id === val.id}
      groupBy={() => team.name /* show team name on top of all options */}
      renderInput={params => (
        <TextField
          {...params}
          autoFocus
          name="project-title"
          label={
            <FormattedMessage id="destinationProjects.choose" defaultMessage="Choose a list" />
          }
          variant="outlined"
        />
      )}
    />
  );
}
DestinationProjects.defaultProps = {
  value: null,
};
DestinationProjects.propTypes = {
  value: PropTypes.object, // GraphQL "Project" object or null
  team: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired, // func(<Project>) => undefined
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};

export default createFragmentContainer(DestinationProjects, graphql`
  fragment DestinationProjects_team on Team {
    name
    projects(first: 10000) {
      edges {
        node {
          id
          dbid
          title
          medias_count  # Add|MoveProjectMediaToProjectAction optimistic update
          search_id  # Add|MoveProjectMediaToProjectAction optimistic update
          ...UpdateProjectMediaMutation_srcProj
          ...BulkArchiveProjectMediaMutation_project
          ...BulkCreateProjectMediaProjectsMutation_project
          ...BulkDeleteProjectMediaProjectsMutation_project
          ...BulkUpdateProjectMediaProjectsMutation_srcProject
          ...BulkUpdateProjectMediaProjectsMutation_dstProject
        }
      }
    }
  }
`);
