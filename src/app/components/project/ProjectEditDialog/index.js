import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import ProjectEditDialogComponent from './ProjectEditDialogComponent';

const ProjectEditDialog = ({ projectDbid, onDismiss }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ProjectEditDialogQuery($projectDbid: String!) {
        project(id: $projectDbid) {
          id
          title
          description
        }
      }
    `}
    variables={{
      projectDbid: `${projectDbid}`,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return <ProjectEditDialogComponent project={props.project} onDismiss={onDismiss} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

ProjectEditDialog.propTypes = {
  projectDbid: PropTypes.number.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default ProjectEditDialog;
