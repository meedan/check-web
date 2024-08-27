/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import cx from 'classnames/bind';
import TeamTasksListItem from './TeamTasksListItem';
import settingsStyles from './Settings.module.css';

const TeamTasksProject = props => props.project.teamTasks.length ? (
  <div className={cx('team-tasks-project', settingsStyles['setting-content-container'])}>
    {
      props.project.title ?
        <Box pb={2}>{props.project.title}</Box>
        : null
    }
    <List>
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
    </List>
  </div>
) : null;

TeamTasksProject.propTypes = {
  project: PropTypes.shape({
    teamTasks: PropTypes.array,
    title: PropTypes.string,
  }).isRequired,
  team: PropTypes.object.isRequired,
  about: PropTypes.object.isRequired,
};

export default TeamTasksProject;
