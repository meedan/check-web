import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import CorporateFareIcon from '@material-ui/icons/CorporateFare';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldTeams = ({
  selected,
  onChange,
  onRemove,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldTeamsQuery {
        about {
          teams
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        const { teams } = props.about;
        const options = Object.keys(teams).map(t => ({ label: teams[t], value: t }));
        return (
          <FormattedMessage id="SearchFieldTeams.label" defaultMessage="Organization is" description="Prefix label for field to filter by workspace">
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

SearchFieldTeams.defaultProps = {
  selected: [],
};

SearchFieldTeams.propTypes = {
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldTeams;
