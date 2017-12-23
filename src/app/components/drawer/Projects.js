import React from 'react';
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

const DrawerProjectsComponent = (props) => {
  const projectList = (() => {
    if (props.team.projects.edges.length === 0) {
      return (
        <Text style={{ margin: `0 ${units(2)}` }} font={caption}>
          <FormattedMessage
            id="projects.noProjects"
            defaultMessage="No projects yet."
          />
        </Text>
      );
    }

    return props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${props.team.slug}/project/${p.node.dbid}`;
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
};

const DrawerProjectsContainer = Relay.createContainer(DrawerProjectsComponent, {
  initialVariables: {
    pageSize: 10000,
  },
  fragments: {
    team: () => teamFragment,
  },
});

const DrawerProjects = (props) => {
  const route = new TeamRoute({ teamSlug: props.team });
  return (
    <Relay.RootContainer
      Component={DrawerProjectsContainer}
      route={route}
      renderFetched={data => <DrawerProjectsContainer {...props} {...data} />}
    />
  );
};

export default DrawerProjects;
