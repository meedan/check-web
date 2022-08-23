/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldUser = ({
  teamSlug,
  label,
  icon,
  selected,
  extraOptions,
  onChange,
  onRemove,
  readOnly,
  onToggleOperator,
  operator,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldUserQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          users(first: 10000) {
            edges {
              node {
                id
                dbid
                name
                is_bot
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
      if (!error && props) {
        const users = props.team.users ?
          props.team.users.edges.slice()
            .filter(u => !u.node.is_bot)
            .sort((a, b) => a.node.name.localeCompare(b.node.name)) : [];

        return (
          <MultiSelectFilter
            label={label}
            icon={icon}
            selected={selected}
            options={extraOptions.concat(users.map(u => ({ label: u.node.name, value: `${u.node.dbid}` })))}
            onChange={(newValue) => { onChange(newValue); }}
            readOnly={readOnly}
            onRemove={onRemove}
            onToggleOperator={onToggleOperator}
            operator={operator}
          />
        );
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return <CircularProgress size={36} />;
    }}
  />
);

SearchFieldUser.defaultProps = {
  selected: [],
  extraOptions: [],
  onToggleOperator: null,
  operator: null,
};

SearchFieldUser.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  selected: PropTypes.array,
  extraOptions: PropTypes.array,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onToggleOperator: PropTypes.func,
  operator: PropTypes.string,
};

export default SearchFieldUser;
