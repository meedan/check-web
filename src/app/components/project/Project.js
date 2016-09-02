import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';
import MediasAndAnnotations from '../MediasAndAnnotations';
import TeamSidebar from '../TeamSidebar';

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

        <div className='project__team-sidebar'>{/* className={this.sidebarActiveClass('home__sidebar')} */}
          <TeamSidebar />
        </div>
        <div className="project__content">
          <MediasAndAnnotations
            medias={project.medias.edges}
            annotations={project.annotations.edges}
            annotated={project}
            annotatedType="Project"
            types={['comment']} />

          <Link to="/medias/new" id="link-medias-new" className="project__new-media-link" title="Create a report">+ New report...</Link>
        </div>
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
        description,
        team {
          id
        },
        annotations(first: 20) {
          edges {
            node {
              id,
              content,
              annotation_type,
              created_at,
              annotator {
                name,
                profile_image
              }
            }
          }
        },
        medias(first: 20) {
          edges {
            node {
              id,
              dbid,
              url,
              published,
              jsondata,
              annotations_count,
              domain,
              last_status
            }
          }
        }
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
