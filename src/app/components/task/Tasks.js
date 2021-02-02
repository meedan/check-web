import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Task from './Task';
import ReorderTask from './ReorderTask';
import BlankState from '../layout/BlankState';

const Tasks = ({
  fieldset,
  tasks,
  media,
}) => {
  const teamSlug = /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null;
  const goToSettings = () => browserHistory.push(`/${teamSlug}/settings/metadata`);

  const isBrowserExtension = (window.parent !== window);
  const isMetadata = fieldset === 'metadata';

  if (tasks.length === 0) {
    return (
      <React.Fragment>
        <BlankState>
          { isMetadata ?
            <FormattedMessage id="tasks.blankMetadata" defaultMessage="No metadata fields" /> :
            <FormattedMessage id="tasks.blankTasks" defaultMessage="No tasks" />
          }
        </BlankState>
        { !isBrowserExtension && isMetadata ?
          <Box display="flex" justifyContent="center" m={2}>
            <Button variant="contained" color="primary" onClick={goToSettings}>
              <FormattedMessage id="tasks.goToSettings" defaultMessage="Go to settings" />
            </Button>
          </Box>
          : null
        }
      </React.Fragment>
    );
  }

  return (
    <div>
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
