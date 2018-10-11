import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TeamTasksProject from './TeamTasksProject';
import CreateTeamTask from './CreateTeamTask';
import ProjectSelector from '../project/ProjectSelector';
import TaskTypeSelector from '../task/TaskTypeSelector';
import BlankState from '../layout/BlankState';
// import FilterPopup from '../layout/FilterPopup';
import TeamRoute from '../../relay/TeamRoute';
import { ContentColumn } from '../../styles/js/shared';

const TeamTasksComponent = (props) => {
  const projects = [...props.team.projects.edges];

  const taskList = (projectId) => {
    const tasksForProject = [];

    props.team.checklist.forEach((task, index) => {
      if (task.projects.length === 0 || task.projects.indexOf(projectId) > -1) {
        const checklistIndex = { task, index };
        tasksForProject.push(checklistIndex);
      }
    });

    return tasksForProject;
  };

  // TODO: optimization: make only one iteration loop (map) instead of two (forEach and map)
  projects.forEach((p, index) => {
    projects[index].node.teamTasks = taskList(p.node.dbid);
  });

  return (
    <div>
      <ContentColumn>
        <h2><FormattedMessage id="teamTasks.title" defaultMessage="Teamwide tasks" /></h2>
        {/*
          // <FilterPopup>

          // </FilterPopup>
        */}
        <ProjectSelector projects={projects} />
        <TaskTypeSelector />

        { props.team.checklist.length ? projects.map(p =>
          (<TeamTasksProject
            key={p.node.dbid}
            project={p.node}
            team={props.team}
          />))
          : (
            <BlankState>
              <FormattedMessage id="teamTasks.blank" defaultMessage="No teamwide tasks yet" />
            </BlankState>
          )
        }
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CreateTeamTask team={props.team} />
        </div>
      </ContentColumn>
    </div>
  );
};


const TeamTasksContainer = Relay.createContainer(TeamTasksComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        checklist
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
    `,
  },
});

const TeamTasks = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team, direction: props.direction };
  return (
    <Relay.RootContainer
      Component={TeamTasksContainer}
      route={route}
      renderFetched={data => <TeamTasksContainer {...data} {...params} />}
    />
  );
};

export default TeamTasks;
