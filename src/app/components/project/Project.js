import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Pusher from 'pusher-js';
import { Link } from 'react-router';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';
import MediasAndAnnotations from '../MediasAndAnnotations';
import TeamSidebar from '../TeamSidebar';
import { CreateMedia } from '../media';
import Can from '../Can';
import config from 'config';

class ProjectComponent extends Component {
  redirect() {
    var path = window.location.protocol + '//' + 
               Checkdesk.context.team.subdomain + '.' + 
               config.selfHost + 
               '/project/' + 
               Checkdesk.context.project.dbid;
    window.location.href = path;
  }

  setContextProject() {
    Checkdesk.context.project = this.props.project;
    if (!Checkdesk.context.team || Checkdesk.context.team.subdomain != this.props.project.team.subdomain) {
      Checkdesk.context.team = this.props.project.team;
      // this.redirect();
      Checkdesk.history.push('/404');
    }
    this.props.relay.setVariables({ contextId: Checkdesk.context.project.dbid });
  }

  subscribe() {
    if (window.Checkdesk.pusher) {
      const that = this;
      window.Checkdesk.pusher.subscribe(this.props.project.pusher_channel).bind('media_updated', function(data) {
        that.props.relay.forceFetch();
      });
    }
  }

  unsubscribe() {
    if (window.Checkdesk.pusher) {
      window.Checkdesk.pusher.unsubscribe(this.props.project.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    this.setContextProject();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  render() {
    const project = this.props.project;
    var that = this;

    return (
      <div className="project">

        <div className='project__team-sidebar'>{/* className={this.sidebarActiveClass('home__sidebar')} */}
          <TeamSidebar />
        </div>
        <div className="project__content">
          <Can permissions={project.permissions} permission='create Media'>
            <CreateMedia projectComponent={that} />
          </Can>

          <MediasAndAnnotations
            medias={project.medias.edges}
            annotations={project.annotations.edges}
            annotated={project}
            annotatedType="Project"
            types={['comment']} />
        </div>
      </div>
    );
  }
}

const ProjectContainer = Relay.createContainer(ProjectComponent, {
  initialVariables: {
    contextId: null
  },
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        pusher_channel,
        permissions,
        team {
          id,
          dbid,
          subdomain,
          projects(first: 10000) {
            edges {
              node {
                id,
                dbid,
                title
              }
            }
          }
        },
        annotations(first: 10000) {
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
        medias(first: 10000) {
          edges {
            node {
              id,
              dbid,
              url,
              published,
              jsondata,
              annotations_count,
              domain,
              last_status(context_id: $contextId),
              permissions,
              verification_statuses
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
