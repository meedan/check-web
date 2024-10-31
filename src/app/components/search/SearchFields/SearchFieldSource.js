/* eslint-disable react/sort-prop-types */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Loader from '../../cds/loading/Loader';
import SettingsInputAntennaIcon from '../../../icons/settings_input_antenna.svg';
import MultiSelectFilter from '../MultiSelectFilter';

let lastTypedValue = '';

const SearchFieldSource = ({
  onChange,
  onRemove,
  selected,
  teamSlug,
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
      render={({ error, props }) => {
        if (!error && props) {
          const options = props.team.sources.edges.map(s => s.node).sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ label: s.name, value: `${s.dbid}` }));
          const total = props.team.sources_count;
          return (
            <FormattedMessage defaultMessage="Source is" description="Prefix label for field to filter by source" id="searchFieldSource.label">
              { label => (
                <MultiSelectFilter
                  icon={<SettingsInputAntennaIcon />}
                  inputPlaceholder={total > max ? keyword : null}
                  label={label}
                  options={options}
                  selected={selected}
                  onChange={(newValue) => { onChange(newValue); }}
                  onRemove={onRemove}
                  onType={total > max ? handleType : null}
                />
              )}
            </FormattedMessage>
          );
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <Loader size="icon" theme="grey" variant="icon" />;
      }}
      variables={{
        teamSlug,
        keyword,
        max,
        random,
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
