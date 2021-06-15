import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldSource = ({
  teamSlug,
  selected,
  onChange,
  onRemove,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldSourceQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          sources(first: 10000) {
            edges {
              node {
                id
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
    }}
    render={({ error, props }) => {
      console.log(props); // eslint-disable-line no-console
      if (!error && props) {
        const options = props.team.sources.edges.map(s => s.node).sort((a, b) => a.name.localeCompare(b.name)).map(s => ({ label: s.name, value: `${s.dbid}` }));
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
