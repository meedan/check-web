import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TeamTasksProject from './TeamTasksProject';
import CreateTeamTask from './CreateTeamTask';
import ProjectSelector from '../project/ProjectSelector';
import TaskTypeSelector from '../task/TaskTypeSelector';
import BlankState from '../layout/BlankState';
import FilterPopup from '../layout/FilterPopup';
import TeamRoute from '../../relay/TeamRoute';
import { ContentColumn, units } from '../../styles/js/shared';

class TeamTasksComponent extends React.Component {
  state = {
    projFilter: [],
    typeFilter: [],
  };

  handleSelectProjects = (projFilter) => {
    this.setState({ projFilter });
  };

  handleSelectTaskTypes = (typeFilter) => {
    this.setState({ typeFilter });
  };

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  };

  filterChecklist = (checklist) => {
    const { typeFilter, search } = this.state;
    let filteredChecklist = checklist;

    if (search) {
      filteredChecklist = checklist.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()));
    }

    if (typeFilter.length) {
      filteredChecklist = checklist.filter(t =>
        typeFilter.indexOf(t.type) > -1);
    }

    return filteredChecklist;
  };

  filterProjects = (projects) => {
    const { projFilter } = this.state;
    if (projFilter.length) {
      return projects.filter(p => projFilter.indexOf(`${p.node.dbid}`) > -1);
    }
    return projects;
  };

  render() {
    const projects = this.filterProjects(this.props.team.projects.edges);
    const checklist = this.filterChecklist(this.props.team.checklist);

    const taskList = (projectId) => {
      const tasksForProject = [];

      checklist.forEach((task, index) => {
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
          <FilterPopup
            search={this.state.search}
            onSearchChange={this.handleSearchChange}
            label={
              <FormattedMessage
                id="teamTasks.filterLabel"
                defaultMessage="{length, number} tasks"
                values={{ length: checklist.length }}
              />
            }
            tooltip={<FormattedMessage id="teamTasks.filter" defaultMessage="Filter tasks" />}
          >
            <div style={{ marginTop: units(4) }}>
              <FormattedMessage id="teamTasks.projFilter" defaultMessage="Show tasks in" />
              <ProjectSelector
                projects={this.props.team.projects.edges}
                selected={this.state.projFilter}
                onSelect={this.handleSelectProjects}
              />
            </div>
            <div style={{ marginTop: units(2) }}>
              <FormattedMessage id="teamTasks.typeFilter" defaultMessage="Task type" />
              <TaskTypeSelector
                selected={this.state.typeFilter}
                onSelect={this.handleSelectTaskTypes}
              />
            </div>
          </FilterPopup>

          { checklist.length && projects.length ? projects.map(p =>
            (<TeamTasksProject
              key={p.node.dbid}
              project={p.node}
              team={this.props.team}
            />))
            : (
              <BlankState>
                <FormattedMessage id="teamTasks.blank" defaultMessage="No teamwide tasks to display" />
              </BlankState>
            )
          }
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CreateTeamTask team={this.props.team} />
          </div>
        </ContentColumn>
      </div>
    );
  }
}

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
