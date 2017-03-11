import React, { Component, PropTypes } from 'react';
import Task from './Task';

class Tasks extends Component {

  render() {
    const { media, tasks } = this.props;

    return (
      <div className="tasks">
        <ul className="tasks__list / tasks-list">
          {tasks.map(task => (
            <li><Task task={task.node} media={media} /></li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Tasks;
