import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import CorporateFareIcon from '@material-ui/icons/CorporateFare';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldClusterTeams = ({
  selected,
  onChange,
  onRemove,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldClusterTeamsQuery {
        root {
          current_team {
            country_teams
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        let options = [];
        if (props.root) {
          const { country_teams: countryTeams } = props.root ? props.root.current_team : {};
          options = Object.keys(countryTeams).map(t => ({ label: countryTeams[t], value: t }));
        }
        return (
          <FormattedMessage id="SearchFieldClusterTeams.label" defaultMessage="Organization is" description="Prefix label for field to filter by workspace">
            { label => (
              <MultiSelectFilter
                label={label}
                icon={<CorporateFareIcon />}
                selected={selected}
                options={options}
                onChange={(newValue) => { onChange(newValue); }}
                onRemove={onRemove}
              />
            )}
          </FormattedMessage>
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
