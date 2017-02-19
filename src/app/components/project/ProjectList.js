import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Can from '../Can';
import CreateProject from './CreateProject';
import { bemClass } from '../../helpers';

class ProjectList extends Component {
  render() {
    const { team, showCreate } = this.props;

    return (
      <ul className="project-list">
        {team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title)).map(p => {
          const projectPath = `/${team.slug}/project/${p.node.dbid}`;
          return (
            <li className="project-list__project">
              <Link to={projectPath} className={bemClass("project-list__link", window.location.pathname.includes(projectPath) , '--active')}>{p.node.title}</Link>
            </li>
          );
        })}
        {showCreate ? (
          <Can permissions={team.permissions} permission="create Project">
            <li className="project-list__new">
              <CreateProject className="project-list__input" team={team} autofocus />
            </li>
          </Can>
        ) : null}
      </ul>
    );
  }
}

export default ProjectList;
