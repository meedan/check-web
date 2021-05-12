import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ProjectMoveDialogComponent from './ProjectMoveDialogComponent';

const renderQuery = ({ error, props }, onCancel, project) => {
  if (!error && props) {
    return (
      <ProjectMoveDialogComponent
        team={props.team}
        project={project}
        projectGroups={props.team.project_groups.edges.map(pg => pg.node)}
        onCancel={onCancel}
      />
    );
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const ProjectMoveDialog = ({ onCancel, project }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  // Not in a team context
  if (teamSlug === 'check') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ProjectMoveDialogQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            dbid
            name
            project_groups(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={data => renderQuery(data, onCancel, project)}
    />
  );
};

ProjectMoveDialog.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    project_group_id: PropTypes.number.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProjectMoveDialog;
