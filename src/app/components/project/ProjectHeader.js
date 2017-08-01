import React, { Component } from 'react';
import Relay from 'react-relay';
import Select from 'react-select';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import { mediaQuery, units, black02, black54, black87, headerHeight, black32 } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {
  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getPusher() {
    const context = new CheckContext(this);
    return context.getContextStore().pusher;
  }

  unsubscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      pusher.unsubscribe(this.props.project.team.pusher_channel);
    }
  }

  subscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.project.team.pusher_channel).bind('project_created', () => {
        that.props.relay.forceFetch();
      });
    }
  }

  render() {
    const currentProject = this.props.project;

    const StyledSelect = styled(Select)`
      min-width: 200px;
      background-color: transparent!important;
      &:hover {
        background-color: ${black02};
      }
    `;

    const DropDownMenuOptions = (currentProject.team.projects.edges
    .sortp((a, b) => a.node.title.localeCompare(b.node.title))
    .map((p) => {
      const projectPath = `/${currentProject.team.slug}/project/${p.node.dbid}`;
      return ({ label: p.node.title, value: projectPath });
    }));

    return (
      <StyledSelect
        autosize
        autoBlur
        clearable={false}
        className="project-header__title"
        value={currentProject.title}
        options={DropDownMenuOptions}
        onChange={(object) => { window.location = object.value; }}
      />
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          pusher_channel,
          get_slack_notifications_enabled,
          projects(first: 10000) {
            edges {
              node {
                title,
                dbid,
                id,
              }
            }
          }
        }
      }
    `,
  },
});

class ProjectHeader extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer
        Component={ProjectHeaderContainer}
        route={route}
      />);
    }
    return null;
  }
}

export default ProjectHeader;
