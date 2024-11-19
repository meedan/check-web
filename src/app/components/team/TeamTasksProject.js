import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import TeamTasksListItem from './TeamTasksListItem';
import settingsStyles from './Settings.module.css';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <div className={cx('team-tasks-project', settingsStyles['setting-content-container'])}>
    {
      props.project.title ?
        <div className={settingsStyles['setting-content-container-title']}>
          <span>{props.project.title}</span>
        </div>
        : null
    }
    <ul>
      {props.project.teamTasks.map((task, index) =>
        (<TeamTasksListItem
          about={props.about}
          index={index + 1}
          isFirst={index === 0}
          isLast={index === props.project.teamTasks.length - 1}
          key={`${task.label}-${task.type}`}
          task={task}
          tasks={props.project.teamTasks}
          team={props.team}
        />))}
    </ul>
  </div>
) : null;

TeamTasksProject.propTypes = {
  about: PropTypes.object.isRequired,
  project: PropTypes.shape({
    teamTasks: PropTypes.array,
    title: PropTypes.string,
  }).isRequired,
  team: PropTypes.object.isRequired,
};

export default TeamTasksProject;
