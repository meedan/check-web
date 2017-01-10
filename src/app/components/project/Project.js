import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Pusher from 'pusher-js';
import { Link } from 'react-router';
import InfiniteScroll from 'react-infinite-scroller';
import DocumentTitle from 'react-document-title';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';
import MediasAndAnnotations from '../MediasAndAnnotations';
import TeamSidebar from '../TeamSidebar';
import { CreateMedia } from '../media';
import Can from '../Can';
import config from 'config';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';

const pageSize = 20;

class ProjectComponent extends Component {
  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  setContextProject() {
    const context = this.getContext(),
      currentContext = this.currentContext(),
      newContext = {};

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.subdomain != this.props.project.team.subdomain) {
      newContext.team = this.props.project.team;
      notFound = true;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/404');
    }
  }

  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.project.pusher_channel).bind('media_updated', (data) => {
        that.props.relay.forceFetch();
      });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.project.pusher_channel);
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

  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.project.medias.edges.length + pageSize });
  }

  render() {
    const project = this.props.project;
    const that = this;

    return (
      <DocumentTitle title={pageTitle(project.title, false, this.currentContext().team)} >
        <div className="project">

          <div className="project__team-sidebar">{/* className={this.sidebarActiveClass('home__sidebar')} */}
            <TeamSidebar />
          </div>
          <div className="project__content">
            <Can permissions={project.permissions} permission="create Media">
              <CreateMedia projectComponent={that} />
            </Can>

            <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} threshold={500}>

              <MediasAndAnnotations
                medias={project.medias.edges}
                annotations={project.annotations.edges}
                annotated={project}
                annotatedType="Project"
                types={['comment']}
              />

            </InfiniteScroll>

            {(() => {
              if (this.props.project.medias.edges.length < this.props.project.medias_count) {
                return (<p className="project__medias-loader">Loading...</p>);
              }
            })()}
          </div>

        </div>
      </DocumentTitle>
    );
  }
}

ProjectComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectContainer = Relay.createContainer(ProjectComponent, {
  initialVariables: {
    contextId: null,
    pageSize,
  },
  fragments: {
    project: ({ Component, contextId }) => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        pusher_channel,
        permissions,
        medias_count,
        team {
          id,
          dbid,
          subdomain
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
        medias(first: $pageSize) {
          edges {
            node {
              id,
              dbid,
              url,
              quote,
              published,
              embed,
              annotations_count,
              domain,
              last_status,
              permissions,
              verification_statuses,
              user {
                name,
                source {
                  dbid
                }
              }
              tags(first: 10000) {
                edges {
                  node {
                    tag,
                    id
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

class Project extends Component {
  render() {
    const projectId = this.props.params.projectId;
    const route = new ProjectRoute({ contextId: parseInt(projectId) });
    return (<Relay.RootContainer Component={ProjectContainer} route={route} />);
  }
}

export default Project;
