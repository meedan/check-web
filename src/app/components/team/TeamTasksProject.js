import React from 'react';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import TeamTasksListItem from './TeamTasksListItem';
import { units } from '../../styles/js/shared';

const TeamTasksProject = props => (
  <div style={{ marginTop: units(2), marginBottom: units(2) }}>
    <div style={{ paddingBottom: units(2) }}>{props.project.title}</div>
    <div>
      <Card>
        <List>
          { props.project.teamTasks
            ? props.project.teamTasks.map(task =>
              <TeamTasksListItem key={task.label} task={task} />)
            : <span>No teamwide tasks yet</span>
          }
        </List>
      </Card>
    </div>
  </div>
);

export default TeamTasksProject;
