import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import {
  Text,
  black54,
  units,
  caption,
} from '../../styles/js/shared';

const SubHeading = styled.div`
  font: ${caption};
  color: ${black54};
  padding: ${units(2)} ${units(2)} ${units(1)} ${units(2)};
`;

class ProjectsComponent extends Component {
  render() {
    const projectList = (() => {
      if (this.props.team.projects.edges.length === 0) {
        return (
          <Text style={{ margin: `0 ${units(2)}` }} font={caption}>
            <FormattedMessage
              id="projects.noProjects"
              defaultMessage="No projects yet."
            />
          </Text>
        );
      }

      return this.props.team.projects.edges
        .sortp((a, b) => a.node.title.localeCompare(b.node.title))
        .map((p) => {
          const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;
          return (
            <Link to={projectPath} key={p.node.dbid} >
              <MenuItem primaryText={<Text ellipsis>{p.node.title}</Text>} />
            </Link>
          );
        });
    })();

    return (
      <div>
        <SubHeading>
          <FormattedMessage
            id="projects.projectsSubheading"
            defaultMessage="Projects"
          />
        </SubHeading>
        <div>
          {projectList}
        </div>
      </div>
    );
  }
}

const ProjectsContainer = Relay.createContainer(ProjectsComponent, {
  initialVariables: {
    pageSize: 10000,
  },
  fragments: {
    team: () => teamFragment,
  },
});

class Projects extends Component {
  render() {
    const route = new TeamRoute({ teamSlug: this.props.team });
    return (
      <Relay.RootContainer
        Component={ProjectsContainer}
        route={route}
        renderFetched={data => <ProjectsContainer {...this.props} {...data} />}
      />
    );
  }
}

export default Projects;
