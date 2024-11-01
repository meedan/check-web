import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Loader from '../../cds/loading/Loader';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldClusterTeams = ({
  icon,
  label,
  onChange,
  onRemove,
  selected,
  teamSlug,
}) => {
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldClusterTeamsQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            shared_teams
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          const { shared_teams: sharedTeams } = props.team;
          const options = Object.keys(sharedTeams).map(t => ({ label: sharedTeams[t], value: t }));

          return (
            <MultiSelectFilter
              icon={icon}
              label={label}
              options={options}
              selected={selected}
              onChange={(newValue) => { onChange(newValue); }}
              onRemove={onRemove}
            />
          );
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <Loader size="small" theme="white" variant="inline" />;
      }}
      variables={{
        teamSlug,
        random,
      }}
    />
  );
};

SearchFieldClusterTeams.defaultProps = {
  selected: [],
};

SearchFieldClusterTeams.propTypes = {
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldClusterTeams;
