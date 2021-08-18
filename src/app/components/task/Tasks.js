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

  // This function determines if we should show a metadata item based on conditional prerequisites
  function showMetadataItem(task) {
    const { conditional_info } = task.node.team_task;
    if (conditional_info) {
      try {
        const parsedConditionalInfo = JSON.parse(conditional_info);
        const { selectedFieldId, selectedConditional, selectedCondition } = parsedConditionalInfo;
        const matchingTask = tasks.find(item => item.node.team_task_id === selectedFieldId);
        if (selectedConditional === 'is' && matchingTask.node.first_response_value === selectedCondition) {
          return true;
        } else if (selectedConditional === 'is not' && matchingTask.node.first_response_value !== selectedCondition) {
          return true;
        } else if (selectedConditional === 'is empty' && matchingTask.node.first_response_value === null) {
          return true;
        } else if (selectedConditional === 'is not empty' && matchingTask.node.first_response_value !== null) {
          return true;
        }
        return false;
      } catch (e) {
        throw (e);
      }
    }
    return true;
  }

  if (isMetadata) {
    output = (
      <StyledMetadataContainer>
        <ul className="tasks__list">
          {tasks
            .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
            .filter(showMetadataItem)
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
