import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import {
  Text,
  units,
  caption,
} from '../../styles/js/shared';

const DrawerProjects = (props) => {
  const projectList = (() => {
    if (!props.team.projects.edges.length) {
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
      <div>
        {projectList}
      </div>
    </div>
  );
};

export default DrawerProjects;
