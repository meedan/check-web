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

const styles = {
  drawerProjects: {
    overflow: 'auto',
    marginBottom: 'auto',
  },
};

class ProjectsComponent extends Component {
  render() {
    return (
      <div>
        <SubHeading>
          <FormattedMessage
            id="projects.projectsSubheading"
            defaultMessage="Projects"
          />
        </SubHeading>
        <div style={styles.drawerProjects}>
          {this.props.team.projects.edges
            .sortp((a, b) => a.node.title.localeCompare(b.node.title))
            .map((p) => {
              const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;
              return (
                <Link to={projectPath} key={p.node.dbid} >
                  <MenuItem primaryText={<Text ellipsis>{p.node.title}</Text>} />
                </Link>
              );
            })}
        </div>
      </div>
    );
  }
}

const ProjectsContainer = Relay.createContainer(ProjectsComponent, {
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
