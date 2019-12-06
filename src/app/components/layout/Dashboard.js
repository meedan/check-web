import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import Search from '../search/Search';
import CheckContext from '../../CheckContext';
import { ContentColumn } from '../../styles/js/shared';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';

class DashboardComponent extends React.Component {
  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  getContext() {
    return new CheckContext(this);
  }

  setContextProject() {
    const context = this.getContext();
    const currentContext = this.currentContext();
    const newContext = {};

    if (currentContext.currentUser &&
       (!currentContext.project || currentContext.project.dbid !== this.props.project.dbid)) {
      Relay.Store.commitUpdate(
        new UpdateUserMutation({
          current_project_id: this.props.project.dbid,
          current_user_id: currentContext.currentUser.id,
        }),
        { onSuccess: () => {}, onFailure: () => {} },
      );
    }

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.slug !== this.props.project.team.slug) {
      newContext.team = this.props.project.team;
      notFound = true;
    }
    if (currentContext.team && !currentContext.team.projects) {
      newContext.team = this.props.project.team;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/check/not-found');
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const projects = this.props.team ? this.props.team.projects.edges
      .filter(p => p.node.dbid === parseInt(this.props.params.projectId, 10)) : [];

    console.log('projects');

    return (
      <div>
        {console.log('this.props', this.props)}
        <ContentColumn wide>
          <div id="dashboard__content">
            { projects.map(p => (
              <Search
                team={this.props.team.slug}
                project={p.node}
                query={this.props.params.query || '{}'}
                fields={['date', 'keyword', 'status', 'sort', 'tags', 'show', 'dynamic', 'bulk', 'rules']}
                view="dense"
              />
            )) }
          </div>
        </ContentColumn>
      </div>
    );
  }
}

DashboardComponent.contextTypes = {
  store: PropTypes.object,
};

const DashboardContainer = Relay.createContainer(DashboardComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        slug,
        permissions,
        projects(first: 10000) {
          edges {
            node {
              title,
              dbid,
              id,
              search_id,
            }
          }
        }
      }
    `,
  },
});

const Dashboard = (props) => {
  const route = new TeamRoute({ teamSlug: props.params.team });
  return (
    <RelayContainer
      Component={DashboardContainer}
      route={route}
      renderFetched={data => <DashboardContainer {...props} {...data} />}
    />
  );
};

export default Dashboard;
