import React, { Component } from 'react';
import Task from './Task';

class Tasks extends Component {
  render() {
    const { media, tasks } = this.props;

    return (
      <div className="tasks">
        <ul className="tasks__list / tasks-list">
          {tasks
            .sortp((a, b) => a.node.dbid - b.node.dbid)
            .map(task => <li key={task.node.dbid}><Task task={task.node} media={media} /></li>)}
        </ul>
      </div>
    );
  }
}

export default Tasks;
