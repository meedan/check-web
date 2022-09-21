/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldProjectGroup = ({
  teamSlug,
  projectGroup,
  query,
  onChange,
  onRemove,
  readOnly,
}) => {
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldProjectGroupQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            id
            project_groups(first: 10000) {
              edges {
                node {
                  title
                  dbid
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
        random,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const selectedProjectGroups = query.project_group_id ? query.project_group_id.map(p => `${p}`) : [];
          const selected = projectGroup ? [projectGroup.dbid] : selectedProjectGroups;
          const projectGroupOptions = [];
          props.team.project_groups.edges.slice().map(pg => pg.node).sort((a, b) => a.title.localeCompare(b.title)).forEach((pg) => {
            projectGroupOptions.push({ label: pg.title, value: `${pg.dbid}` });
          });

          return (
            <FormattedMessage id="SearchFieldProjectGroup.collection" defaultMessage="Collection is" description="Prefix label for field to filter by collection">
              { label => (
                <MultiSelectFilter
                  label={label}
                  icon={<FolderSpecialIcon />}
                  options={projectGroupOptions}
                  selected={selected}
                  onChange={onChange}
                  readOnly={readOnly}
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
};

SearchFieldProjectGroup.defaultProps = {
  projectGroup: null,
};

SearchFieldProjectGroup.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
  query: PropTypes.object.isRequired,
  projectGroup: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
};

export default SearchFieldProjectGroup;
