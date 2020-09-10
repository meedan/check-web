import React from 'react';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import TeamTasksListItem from './TeamTasksListItem';
import { units } from '../../styles/js/shared';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <div className="team-tasks-project" style={{ marginTop: units(2), marginBottom: units(2) }}>
    {
      props.project.title ?
        <div style={{ paddingBottom: units(2) }}>{props.project.title}</div>
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
  </div>
) : null;

export default TeamTasksProject;
