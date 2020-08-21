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
  const isMetadata = fieldset === 'metadata';
  const teamSlug = /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null;

  const goToSettings = () => browserHistory.push(`/${teamSlug}/settings/metadata`);

  if (isMetadata && tasks.length === 0) {
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
    <div className="tasks">
      <ul className="tasks__list / tasks-list">
        {tasks.map(task => (
          <li key={task.node.dbid}>
            { isMetadata ? (
              <Task task={task.node} media={media} />
            ) : (
              <ReorderTask fieldset={fieldset} task={task.node}>
                <Task task={task.node} media={media} />
              </ReorderTask>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
