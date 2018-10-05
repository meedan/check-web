import React from 'react';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import TeamTasksListItem from './TeamTasksListItem';
import { units } from '../../styles/js/shared';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <div style={{ marginTop: units(2), marginBottom: units(2) }}>
    <div style={{ paddingBottom: units(2) }}>{props.project.title}</div>
    <div>
      <Card>
        <List>
          {props.project.teamTasks.map(obj =>
            <TeamTasksListItem key={obj.task.label} taskContainer={obj} team={props.team} />)
          }
        </List>
      </Card>
    </div>
  </div>
) : null;

export default TeamTasksProject;
