import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import PublicIcon from '@material-ui/icons/Public';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldCountry = ({
  selected,
  readOnly,
  onChange,
  onRemove,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldCountryQuery {
        about {
          countries
        }
        root {
          current_team {
            country_teams
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        const options = props.about.countries.map(country => ({ label: country, value: country }));
        return (
          <FormattedMessage id="searchFieldCountry.label" defaultMessage="Country is" description="Prefix label for field to filter by country">
            { label => (
              <MultiSelectFilter
                label={label}
                icon={<PublicIcon />}
                selected={selected}
                options={options}
                onChange={(newValue) => { onChange(newValue); }}
                onRemove={onRemove}
                readOnly={readOnly}
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

SearchFieldCountry.defaultProps = {
  selected: [],
  readOnly: false,
};

SearchFieldCountry.propTypes = {
  selected: PropTypes.array,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldCountry;
