import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import SettingsInputAntennaIcon from '../../../icons/settings_input_antenna.svg';
import MultiSelectFilter from '../MultiSelectFilter';

let lastTypedValue = '';

const SearchFieldSource = ({
  teamSlug,
  selected,
  onChange,
  onRemove,
}) => {
  const [keyword, setKeyword] = React.useState('');
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));

  // Maximum number of options to be displayed
  const max = 500;

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setKeyword(value);
      }
    }, 2000);
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldSourceQuery($teamSlug: String!, $keyword: String, $max: Int, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            sources_count(keyword: $keyword)
            sources(first: $max, keyword: $keyword) {
              edges {
                node {
                  dbid
                  name
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
        keyword,
        max,
        random,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const options = props.team.sources.edges.map(s => s.node).sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ label: s.name, value: `${s.dbid}` }));
          const total = props.team.sources_count;
          return (
            <FormattedMessage id="searchFieldSource.label" defaultMessage="Source is" description="Prefix label for field to filter by source">
              { label => (
                <MultiSelectFilter
                  label={label}
                  icon={<SettingsInputAntennaIcon />}
                  selected={selected}
                  options={options}
                  onChange={(newValue) => { onChange(newValue); }}
                  onRemove={onRemove}
                  onType={total > max ? handleType : null}
                  inputPlaceholder={total > max ? keyword : null}
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
};

SearchFieldSource.defaultProps = {
  selected: [],
};

SearchFieldSource.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldSource;
