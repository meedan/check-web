import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import styled from 'styled-components';
import moment from 'moment';
import Task from './Task';
import ReorderTask from './ReorderTask';
import BlankState from '../layout/BlankState';
import { units } from '../../styles/js/shared';
import { withSetFlashMessage } from '../FlashMessage';

const StyledMetadataContainer = styled.div`
  .tasks__list > li {
    margin: ${units(2)};
  }
`;

const StyledFormControls = styled.div`
  padding-left: ${units(2)};
  padding-top: ${units(2)};
  button {
    margin-right: ${units(1)};
  }
`;

const StyledAnnotatorInformation = styled.span`
  display: inline-block;
  p {
    font-size: 9px;
    color: #979797;
  }
`;

const Tasks = ({
  fieldset,
  tasks,
  media,
  about,
  setFlashMessage,
}) => {
  const teamSlug = /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null;
  const goToSettings = () => browserHistory.push(`/${teamSlug}/settings/metadata`);

  const isBrowserExtension = (window.parent !== window);
  const isMetadata = fieldset === 'metadata';
  const [isEditing, setIsEditing] = React.useState(false);
  const [localResponses, setLocalResponses] = React.useState(tasks);

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

  // Intersection of sets function
  // https://stackoverflow.com/a/37041756/4869657
  function intersect(a, b) {
    const setB = new Set(b);
    return [...new Set(a)].filter(x => setB.has(x));
  }

  // This function determines if we should show a metadata item based on conditional prerequisites
  function showMetadataItem(task) {
    // This response is in the DB but its team_task was deleted. This field should no longer render.
    if (!task.node.team_task) {
      return false;
    }
    const { conditional_info } = task.node.team_task;
    if (conditional_info) {
      try {
        const parsedConditionalInfo = JSON.parse(conditional_info);
        const { selectedFieldId, selectedConditional } = parsedConditionalInfo;
        let { selectedCondition } = parsedConditionalInfo;
        const matchingTask = localResponses.find(item => item.node.team_task_id === selectedFieldId);

        // There is no matching task, which means a conditional prerequisite was deleted. In this case we simply always show this field. See CHECK-986 for reasoning.
        if (!matchingTask) {
          return true;
        }

        // check if there is an "Other" value by looking for the .other prop on options
        const hasOther = matchingTask.node.team_task?.options?.some(item => item.other);
        if (hasOther) {
          // if there is an "Other" value, then extract it by convering our first_response_value to an array and filtering out known values
          const otherValue = matchingTask.node.first_response_value?.split(', ').filter(item => !matchingTask.node.team_task?.options?.some(option => option.label === item))[0];
          // replace "Other" in selectedCondition with that value
          selectedCondition = selectedCondition.replace(/\bOther\b/, otherValue);
        }

        // render nothing if there is no response (the matching metadata item is not filled in)
        if (matchingTask.node.first_response_value === null || matchingTask.node.first_response_value === '') {
          return false;
        }

        if (selectedConditional === 'is...' && matchingTask.node.first_response_value === selectedCondition) {
          return true;
        } else if (selectedConditional === 'is not...' && matchingTask.node.first_response_value !== selectedCondition) {
          return true;
        } else if (selectedConditional === 'is empty...' && matchingTask.node.first_response_value === null) {
          return true;
        } else if (selectedConditional === 'is not empty...' && matchingTask.node.first_response_value !== null) {
          return true;
        } else if (selectedConditional === 'is any of...' && intersect(selectedCondition.split(', '), matchingTask.node.first_response_value?.split(', ')).length > 0) {
          // if the intersection of the options set and the selected set is not empty, then at least one item is in common
          return true;
        } else if (selectedConditional === 'is none of...' && intersect(selectedCondition.split(', '), matchingTask.node.first_response_value?.split(', ')).length === 0) {
          // if the intersection of the options set and the selected set is empty, then we have met the "none of" condition
          return true;
        }
        return false;
      } catch (e) {
        throw (e);
      }
    }
    return true;
  }

  function isAnyRequiredFieldEmpty() {
    // HTML data attributes cast booleans to strings, so we check for equality to
    // the string "true" here
    return Array.from(document.querySelectorAll('.metadata-save'))
      .some(saveButton => saveButton.dataset.empty === 'true' && saveButton.dataset.required === 'true');
  }

  function handleEditAnnotations() {
    document.querySelectorAll('.metadata-edit').forEach((editButton) => {
      editButton.click();
    });
    setIsEditing(true);
  }

  function handleSaveAnnotations() {
    if (isAnyRequiredFieldEmpty()) {
      setFlashMessage((
        <FormattedMessage
          id="metadata.couldNotSave"
          defaultMessage="Could not save, missing required field"
          description="Error message displayed when it's not possible to save metadata due to a required field not being filled in."
        />
      ), 'error');
      return;
    }
    document.querySelectorAll('.metadata-save').forEach((saveButton) => {
      saveButton.click();
    });
    setIsEditing(false);
  }

  function handleCancelAnnotations() {
    document.querySelectorAll('.metadata-cancel').forEach((cancelButton) => {
      cancelButton.click();
    });
    setIsEditing(false);
  }

  function getLatestEditInfo() {
    const latestDate = Math.max(...tasks
      .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
      .filter(showMetadataItem)
      .map((task) => {
        let updated_at;
        try {
          updated_at = JSON.parse(task.node?.first_response?.content)[0]?.updated_at;
        } catch (exception) {
          updated_at = null;
        }
        return new Date(updated_at);
      }));
    if (!latestDate) {
      return null;
    }
    const latestAuthor = tasks
      .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
      .filter(showMetadataItem)
      .find((task) => {
        let updated_at;
        try {
          updated_at = JSON.parse(task.node?.first_response?.content)[0]?.updated_at;
        } catch (exception) {
          updated_at = null;
        }
        return new Date(updated_at).getTime() === latestDate;
      });
    return {
      latestDate,
      latestAuthorDbid: latestAuthor.node?.annotator?.user?.dbid,
      latestAuthorName: latestAuthor.node?.annotator?.user?.name,
    };
  }

  const latestEditInfo = getLatestEditInfo();

  if (isMetadata) {
    output = (
      <StyledMetadataContainer>
        <StyledFormControls>
          {
            isEditing ? (
              <div>
                <Button className="form-save" variant="contained" onClick={handleSaveAnnotations} style={{ backgroundColor: '#1BB157', color: 'white' }}>
                  <FormattedMessage id="metadata.form.save" defaultMessage="Save" description="This is a label on a button at the top of a form. The label indicates that if the user presses this button, the user will save the changes they have been making in the form." />
                </Button>
                <Button className="form-cancel" onClick={handleCancelAnnotations}>
                  <FormattedMessage id="metadata.form.cancel" defaultMessage="Cancel changes" description="This is a label on a button that the user presses in order to revert/cancel any changes made to an unsaved form." />
                </Button>
              </div>
            ) :
              <Button className="form-edit" variant="contained" onClick={handleEditAnnotations} color="primary">
                <FormattedMessage id="metadata.form.edit" defaultMessage="Edit" description="This is a label on a button that the user presses in order to edit the items in the attached form." />
              </Button>
          }
          <p>
            {
              latestEditInfo ? (
                <StyledAnnotatorInformation>
                  <Typography variant="body1">
                    Saved {moment(latestEditInfo.latestDate).fromNow()} by{' '}
                    <a
                      href={`/check/user/${latestEditInfo.latestAuthorDbid}`}
                    >
                      {latestEditInfo.latestAuthorName}
                    </a>
                  </Typography>
                </StyledAnnotatorInformation>
              ) : '...'
            }
          </p>
        </StyledFormControls>
        <Divider />
        <ul className="tasks__list">
          {tasks
            .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
            .filter(showMetadataItem)
            .map(task => (
              <>
                <li key={task.node.dbid}>
                  { (isMetadata || isBrowserExtension) ? (
                    <Task task={task.node} media={media} about={about} isEditing={isEditing} localResponses={localResponses} setLocalResponses={setLocalResponses} />
                  ) : (
                    <ReorderTask fieldset={fieldset} task={task.node}>
                      <Task task={task.node} media={media} />
                    </ReorderTask>
                  )}
                </li>
                <Divider />
              </>
            ))
          }
        </ul>
      </StyledMetadataContainer>
    );
  }

  return output;
};

export default withSetFlashMessage(Tasks);
