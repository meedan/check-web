import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';

class ProjectComponent extends Component {
  setCurrentProject() {
    Checkdesk.currentProject = this.props.project;
  }

  componentDidMount() {
    this.setCurrentProject();
  }

  componentDidUpdate() {
    this.setCurrentProject();
  }

  render() {
    const project = this.props.project;

    return (
      <div className="project">
        <ProjectHeader project={project} />
        <h2 className="project-title">{project.title}</h2>
        <Link to="/medias/new" id="link-medias-new" className="project__new-media-link" title="Create a report">+ New report...</Link>
      </div>
    );
  }
}

const ProjectContainer = Relay.createContainer(ProjectComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description
      }
    `
  }
});

class Project extends Component {
  render() {
    var route = new ProjectRoute({ projectId: this.props.params.projectId });
    return (<Relay.RootContainer Component={ProjectContainer} route={route} />);
  }
}

export default Project;
