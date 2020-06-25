import React from 'react';
import Task from './Task';

const Tasks = props => (
  <div className="tasks">
    <ul className="tasks__list / tasks-list">
      {props.tasks
        .slice() // so sort() doesn't mutate input
        .sort((a, b) => a.node.dbid - b.node.dbid)
        .map(task => <li key={task.node.dbid}><Task task={task.node} media={props.media} /></li>)}
    </ul>
  </div>
);

export default Tasks;
