import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Task from './Task';
import ReorderTask from './ReorderTask';
import BlankState from '../layout/BlankState';

const useStyles = makeStyles({
  taskList: {
    maxHeight: 'calc(100vh - 166px)', // screen height - (media bar + tabs + add task)
  },
  taskListOverflow: {
    overflowY: 'auto',
  },
});

const Tasks = ({
  fieldset,
  tasks,
  media,
  noscroll,
  style,
}) => {
  const teamSlug = /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null;
  const goToSettings = () => browserHistory.push(`/${teamSlug}/settings/metadata`);

  const isBrowserExtension = (window.parent !== window);
  const isMetadata = fieldset === 'metadata';

  const classes = useStyles();
  const taskListClasses = [classes.taskList];
  if (!noscroll) {
    taskListClasses.push(classes.taskListOverflow);
  }

  if (isMetadata && tasks.length === 0 && !isBrowserExtension) {
    return (
      <React.Fragment>
        <BlankState>
          <FormattedMessage id="tasks.blankMetadata" defaultMessage="No metadata fields" />
        </BlankState>
        <Box display="flex" justifyContent="center" m={2}>
          <Button variant="contained" color="primary" onClick={goToSettings}>
            <FormattedMessage id="tasks.goToSettings" defaultMessage="Go to settings" />
          </Button>
        </Box>
      </React.Fragment>
    );
  }

  return (
    <div className={[taskListClasses.join(' ')]} style={style}>
      <ul className="tasks__list">
        {tasks
          .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
          .map(task => (
            <li key={task.node.dbid}>
              { (isMetadata || isBrowserExtension) ? (
                <Task task={task.node} media={media} />
              ) : (
                <ReorderTask fieldset={fieldset} task={task.node}>
                  <Task task={task.node} media={media} />
                </ReorderTask>
              )}
            </li>
          ))
        }
      </ul>
    </div>
  );
};

export default Tasks;
