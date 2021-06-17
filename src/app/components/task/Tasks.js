import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Task from './Task';
import ReorderTask from './ReorderTask';
import BlankState from '../layout/BlankState';
import { units } from '../../styles/js/shared';

const StyledMetadataContainer = styled.div`
  .tasks__list {
    padding: ${units(4)};
  }
  .tasks__list > li {
    margin-bottom: ${units(2)};
  }
`;

const Tasks = ({
  fieldset,
  tasks,
  media,
  about,
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

  let output = null;

  if (!isMetadata) {
    output = (
      <div>
        <ul className="tasks__list">
          {tasks
            .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
            .map(task => (
              <li key={task.node.dbid}>
                { (isMetadata || isBrowserExtension) ? (
                  <Task task={task.node} media={media} about={about} />
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
  }

  if (isMetadata) {
    output = (
      <StyledMetadataContainer>
        <ul className="tasks__list">
          {tasks
            .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
            .map(task => (
              <li key={task.node.dbid}>
                { (isMetadata || isBrowserExtension) ? (
                  <Task task={task.node} media={media} about={about} />
                ) : (
                  <ReorderTask fieldset={fieldset} task={task.node}>
                    <Task task={task.node} media={media} />
                  </ReorderTask>
                )}
              </li>
            ))
          }
        </ul>
      </StyledMetadataContainer>
    );
  }

  return output;
};

export default Tasks;
