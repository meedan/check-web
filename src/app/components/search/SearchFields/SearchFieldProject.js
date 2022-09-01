/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldProject = ({
  teamSlug,
  project,
  query,
  onChange,
  onRemove,
  readOnly,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldProjectQuery($teamSlug: String!, $random: String!) {
        team(slug: $teamSlug, random: $random) {
          id
          projects(first: 10000) {
            edges {
              node {
                title
                dbid
                id
                description
                project_group_id
              }
            }
          }
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
      random: String(Math.random()),
    }}
    render={({ error, props }) => {
      if (!error && props) {
        // Folder options are grouped by collection
        // FIXME: Simplify the code below and improve its performance
        const projects = props.team.projects.edges.slice().map(p => p.node).sort((a, b) => a.title.localeCompare(b.title));
        let projectOptions = [];
        props.team.project_groups.edges.slice().map(pg => pg.node).sort((a, b) => a.title.localeCompare(b.title)).forEach((pg) => {
          const subProjects = [];
          projects.filter(p => p.project_group_id === pg.dbid).forEach((p) => {
            subProjects.push({ label: p.title, value: `${p.dbid}` });
          });
          if (subProjects.length > 0) {
            projectOptions.push({ label: pg.title, value: '', projectsTitles: subProjects.map(sp => sp.label).join(',') });
            projectOptions = projectOptions.concat(subProjects);
          }
        });
        const orphanProjects = [];
        projects.filter(p => !p.project_group_id).forEach((p) => {
          orphanProjects.push({ label: p.title, value: `${p.dbid}` });
        });
        if (orphanProjects.length > 0) {
          projectOptions.push({
            label: <FormattedMessage id="SearchFieldProject.notInAny" defaultMessage="Not in any collection" description="Label displayed before listing all folders that are not part of any collection" />,
            value: '',
            orphanProjects: orphanProjects.map(op => op.label).join(','),
          });
          projectOptions = projectOptions.concat(orphanProjects);
        }

        const selectedProjects = query.projects ? query.projects.map(p => String(p)) : [];
        const selected = project ? [String(project.dbid)] : selectedProjects;

        return (
          <FormattedMessage id="SearchFieldProject.label" defaultMessage="Folder is" description="Prefix label for field to filter by folder to which items belong">
            { label => (
              <MultiSelectFilter
                label={label}
                icon={<FolderOpenIcon />}
                selected={selected}
                options={projectOptions}
                onChange={(newValue) => { onChange(newValue); }}
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

SearchFieldProject.defaultProps = {
  project: null,
};

SearchFieldProject.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default SearchFieldProject;
