/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import intersection from 'lodash.intersection';
import Box from '@material-ui/core/Box';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import ProjectSelector from '../project/ProjectSelector';
import TaskTypeSelector from '../task/TaskTypeSelector';
import BlankState from '../layout/BlankState';
import FilterPopup from '../layout/FilterPopup';

function TeamTasksRender({ team, about }) {
  const [projFilter, setProjFilter] = React.useState([]);
  const [typeFilter, setTypeFilter] = React.useState([]);
  const [search, setSearch] = React.useState('');

  const handleSelectProjects = (value) => {
    setProjFilter(value);
  };

  const handleSelectTaskTypes = (value) => {
    setTypeFilter(value);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filterTeamTasks = (team_tasks) => {
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

  const renderFilterLabel = (filtered, raw) => {
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
  };

  const { team_tasks } = team;
  const filteredTasks = filterTeamTasks(team_tasks.edges).map(task => task.node);
  const filterLabel = renderFilterLabel(filteredTasks, team_tasks.edges);

  return (
    <div className="team-tasks">
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamTasksRender.tasks"
            defaultMessage="Tasks"
            description="Tasks title"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamTasksRender.tasksSubtitle"
            defaultMessage="Add custom tasks to items."
            description="Tasks subtitle"
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/3648632-tasks"
        actionButton={
          <CreateTeamTask fieldset="tasks" associatedType="ProjectMedia" team={team} />
        }
        extra={
          <FilterPopup
            search={search}
            onSearchChange={(e) => { handleSearchChange(e); }}
            label={filterLabel}
            tooltip={
              <FormattedMessage
                id="teamTasksRender.filter"
                defaultMessage="Filter tasks"
                description="Filter tasks"
              />
            }
          >
            <Box mt={4}>
              <FormattedMessage
                id="teamTasksRender.projFilter"
                defaultMessage="Show tasks in"
                description="filter tasks by projects"
              />
              <ProjectSelector
                projects={team.projects.edges}
                selected={projFilter}
                onSelect={handleSelectProjects}
                fullWidth
              />
            </Box>
            <Box mt={2}>
              <FormattedMessage
                id="teamTasksRender.typeFilter"
                defaultMessage="Task type"
                description="filter tasks by type"
              />
              <TaskTypeSelector
                selected={typeFilter}
                onSelect={handleSelectTaskTypes}
                fullWidth
              />
            </Box>
          </FilterPopup>
        }
      />

      { filteredTasks.length ?
        <TeamTasksProject
          fieldset="tasks"
          project={{ teamTasks: filteredTasks }}
          team={team}
          about={about}
        /> :
        <BlankState>
          <FormattedMessage
            id="teamTasksRender.blank"
            defaultMessage="No default tasks to display"
            description="Text for empty tasks"
          />
        </BlankState>
      }
    </div>
  );
}

TeamTasksRender.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object
  about: PropTypes.object.isRequired,
};

export default TeamTasksRender;
