import React from 'react';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import TeamTasksListItem from './TeamTasksListItem';
import { units } from '../../styles/js/shared';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <Box className="team-tasks-project" my={units(2)}>
    {
      props.project.title ?
        <Box pb={units(2)}>{props.project.title}</Box>
        : null
    }
    <div>
      <Card>
        <List>
          {props.project.teamTasks.map(task =>
            (<TeamTasksListItem
              key={`${task.label}-${task.type}`}
              task={task}
              fieldset={props.fieldset}
              team={props.team}
            />))}
        </List>
      </Card>
    </div>
  </Box>
) : null;

export default TeamTasksProject;
