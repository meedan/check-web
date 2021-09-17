import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import TeamTasksListItem from './TeamTasksListItem';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <Box className="team-tasks-project" my={2}>
    {
      props.project.title ?
        <Box pb={2}>{props.project.title}</Box>
        : null
    }
    <div>
      <Card>
        <List>
          {props.project.teamTasks.map((task, index) =>
            (<TeamTasksListItem
              index={index + 1}
              key={`${task.label}-${task.type}`}
              task={task}
              tasks={props.project.teamTasks}
              fieldset={props.fieldset}
              team={props.team}
              about={props.about}
            />))}
        </List>
      </Card>
    </div>
  </Box>
) : null;

TeamTasksProject.propTypes = {
  project: PropTypes.shape({
    teamTasks: PropTypes.array,
    title: PropTypes.string,
  }).isRequired,
  fieldset: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired,
};

export default TeamTasksProject;
