import React from 'react';
import { Link } from 'react-router';
import Can from '../Can';
import CreateProject from './CreateProject';
import { bemClass } from '../../helpers';

const ProjectList = props =>
  (<ul className="project-list">
    {props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${props.team.slug}/project/${p.node.dbid}`;
        return (
          <li key={p.node.dbid} className="project-list__project">
            <Link to={projectPath} className={bemClass('project-list__link', window.location.pathname.includes(projectPath), '--active')}>{p.node.title}</Link>
          </li>
        );
      })
    }
    {props.showCreate ? (
      <Can permissions={props.team.permissions} permission="create Project">
        <li className="project-list__new">
          <CreateProject className="project-list__input" team={props.team} autofocus />
        </li>
      </Can>
    ) : null}
   </ul>);

export default ProjectList;
