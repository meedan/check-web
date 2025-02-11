import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Loader from '../../cds/loading/Loader';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldUser = ({
  extraOptions,
  icon,
  label,
  onChange,
  onRemove,
  onToggleOperator,
  operator,
  readOnly,
  selected,
  teamSlug,
}) => {
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldUserQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            users(first: 10000) {
              edges {
                node {
                  dbid
                  name
                  is_bot
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          const users = props.team.users ?
            props.team.users.edges.slice()
              .filter(u => !u.node.is_bot)
              .sort((a, b) => a.node.name.localeCompare(b.node.name)) : [];

          return (
            <MultiSelectFilter
              icon={icon}
              label={label}
              operator={operator}
              options={extraOptions.concat(users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` })))}
              readOnly={readOnly}
              selected={selected}
              onChange={(newValue) => { onChange(newValue); }}
              onRemove={onRemove}
              onToggleOperator={onToggleOperator}
            />
          );
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <Loader size="icon" theme="grey" variant="icon" />;
      }}
      variables={{
        teamSlug,
        random,
      }}
    />
  );
};

SearchFieldUser.defaultProps = {
  extraOptions: [],
  selected: [],
  operator: null,
  onToggleOperator: null,
};

SearchFieldUser.propTypes = {
  extraOptions: PropTypes.array,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  operator: PropTypes.string,
  readOnly: PropTypes.bool.isRequired,
  selected: PropTypes.array,
  teamSlug: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleOperator: PropTypes.func,
};

export default SearchFieldUser;
