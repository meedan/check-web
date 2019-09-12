import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import intersection from 'lodash.intersection';
import TeamTasksProject from './TeamTasksProject';
import CreateTeamTask from './CreateTeamTask';
import ProjectSelector from '../project/ProjectSelector';
import TaskTypeSelector from '../task/TaskTypeSelector';
import BlankState from '../layout/BlankState';
import CardHeaderOutside from '../layout/CardHeaderOutside';
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

  filterTeamTasks = (team_tasks) => {
    const { projFilter, typeFilter, search } = this.state;
    let filteredTeamTasks = team_tasks || [];

    if (search) {
      filteredTeamTasks = filteredTeamTasks.filter(t =>
        t.node.label.toLowerCase().includes(search.toLowerCase()));
    }

    if (typeFilter.length) {
      filteredTeamTasks = filteredTeamTasks.filter(t =>
        typeFilter.indexOf(t.node.type) > -1);
    }

    if (projFilter.length) {
      const projFilterInt = projFilter.map(f => parseInt(f, 10));
      filteredTeamTasks = filteredTeamTasks.filter(t =>
        intersection(t.node.project_ids, projFilterInt).length > 0 ||
        !t.node.project_ids.length);
    }

    return filteredTeamTasks;
  };

  filterProjects = (projects) => {
    const { projFilter } = this.state;
    if (projFilter.length) {
      return projects.filter(p => projFilter.indexOf(`${p.node.dbid}`) > -1);
    }
    return projects;
  };

  // eslint-disable-next-line class-methods-use-this
  renderFilterLabel(filtered, raw) {
    if (filtered.length !== raw.length) {
      return (
        <FormattedMessage
          id="teamTasks.filterLabelHidden"
          defaultMessage="{total, plural, =0 {No tasks} one {1 task ({hidden} hidden by filters)} other {# tasks ({hidden} hidden by filters)}}"
          values={{ total: raw.length, hidden: raw.length - filtered.length }}
        />
      );
    }

    return (
      <FormattedMessage
        id="teamTasks.filterLabel"
        defaultMessage="{total, plural, =0 {No tasks} one {1 task} other {# tasks}}"
        values={{ total: raw.length }}
      />
    );
  }

  renderTeamTaskProject(projectsWithTasks) {
    return projectsWithTasks.length ?
      projectsWithTasks.map(p =>
        <TeamTasksProject key={p.node.dbid} project={p.node} team={this.props.team} />)
      : (
        <BlankState>
          <FormattedMessage id="teamTasks.blank" defaultMessage="No teamwide tasks to display" />
        </BlankState>
      );
  }

  renderTeamTaskList(teamTasks) {
    return teamTasks.length ?
      <TeamTasksProject project={{ teamTasks }} team={this.props.team} />
      : (
        <BlankState>
          <FormattedMessage id="teamTasks.blank" defaultMessage="No teamwide tasks to display" />
        </BlankState>
      );
  }

  render() {
    const { direction } = this.props;
    const { team_tasks } = this.props.team;
    const filteredTasks = this.filterTeamTasks(team_tasks.edges);
    const filterLabel = this.renderFilterLabel(filteredTasks, team_tasks.edges);

    const getTasksForProjectId = projectId => filteredTasks.filter(task =>
      task.node.project_ids.length === 0 ||
      task.node.project_ids.indexOf(projectId) > -1 ||
      projectId === null).map(task => task.node);

    // const projects = this.filterProjects(this.props.team.projects.edges);

    // const projectsWithTasks = [];
    // projects.forEach((p, index) => {
    //   const projectTasks = getTasksForProjectId(p.node.dbid);
    //   if (projectTasks.length > 0) {
    //     projects[index].node.teamTasks = projectTasks;
    //     projectsWithTasks.push(projects[index]);
    //   }
    // });

    return (
      <div className="team-tasks">
        <ContentColumn>
          <CardHeaderOutside
            direction={direction}
            title={<FormattedMessage id="teamTasks.title" defaultMessage="Tasks" />}
            actions={
              <FilterPopup
                search={this.state.search}
                onSearchChange={this.handleSearchChange}
                label={filterLabel}
                tooltip={<FormattedMessage id="teamTasks.filter" defaultMessage="Filter tasks" />}
              >
                <div style={{ marginTop: units(4) }}>
                  <FormattedMessage id="teamTasks.projFilter" defaultMessage="Show tasks in" />
                  <ProjectSelector
                    projects={this.props.team.projects.edges}
                    selected={this.state.projFilter}
                    onSelect={this.handleSelectProjects}
                    fullWidth
                  />
                </div>
                <div style={{ marginTop: units(2) }}>
                  <FormattedMessage id="teamTasks.typeFilter" defaultMessage="Task type" />
                  <TaskTypeSelector
                    selected={this.state.typeFilter}
                    onSelect={this.handleSelectTaskTypes}
                    fullWidth
                  />
                </div>
              </FilterPopup>
            }
          />
          { this.renderTeamTaskList(getTasksForProjectId(null)) }
          { /* this.renderTeamTaskProject(projectsWithTasks) */ }
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
        team_tasks(first: 10000) {
          edges {
            node {
              id
              dbid
              label
              description
              options
              type
              project_ids
              required
              json_schema
            }
          }
        }
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
export { TeamTasksComponent };
