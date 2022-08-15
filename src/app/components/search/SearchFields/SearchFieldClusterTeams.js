import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldClusterTeams = ({
  label,
  icon,
  teamSlug,
  selected,
  onChange,
  onRemove,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldClusterTeamsQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          shared_teams
        }
      }
    `}
    variables={{ teamSlug }}
    render={({ error, props }) => {
      if (!error && props) {
        const { shared_teams: sharedTeams } = props.team;
        const options = Object.keys(sharedTeams).map(t => ({ label: sharedTeams[t], value: t }));

        return (
          <MultiSelectFilter
            label={label}
            icon={icon}
            selected={selected}
            options={options}
            onChange={(newValue) => { onChange(newValue); }}
            onRemove={onRemove}
          />
        );
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return <CircularProgress size={36} />;
    }}
  />
);

SearchFieldClusterTeams.defaultProps = {
  selected: [],
};

SearchFieldClusterTeams.propTypes = {
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldClusterTeams;
