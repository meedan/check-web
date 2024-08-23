import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import moment from 'moment';
import cx from 'classnames/bind';
import Task from './Task';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import NavigateAwayDialog from '../NavigateAwayDialog';
import BlankState from '../layout/BlankState';
import { withSetFlashMessage } from '../FlashMessage';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from '../media/media.module.css';

const Tasks = ({
  about,
  media,
  setFlashMessage,
  tasks,
}) => {
  const teamSlug = /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null;
  const goToSettings = () => browserHistory.push(`/${teamSlug}/settings/annotation`);

  const isBrowserExtension = (window.parent !== window);
  const [isEditing, setIsEditing] = React.useState(false);
  const [localResponses, setLocalResponses] = React.useState(tasks);

  if (tasks.length === 0) {
    return (
      <React.Fragment>
        <BlankState>
          <FormattedMessage defaultMessage="No Workspace Annotations" description="A message that appears when the Annotation menu is opened but no Annotation fields have been created in the project settings." id="tasks.blankAnnotation" />
        </BlankState>
        { !isBrowserExtension ?
          <div>
            <ButtonMain
              label={
                <FormattedMessage defaultMessage="Go to settings" description="Button label to take the user to the settings area of the application" id="tasks.goToSettings" />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={goToSettings}
            />
          </div>
          : null
        }
      </React.Fragment>
    );
  }

  let output = null;

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
        const { selectedConditional, selectedFieldId } = parsedConditionalInfo;
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

  function isAnyUrlInvalid() {
    // HTML data attributes cast booleans to strings, so we check for equality to
    // the string "true" here
    return Array.from(document.querySelectorAll('.metadata-save'))
      .some(saveButton => saveButton.dataset.urlerror === 'true');
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
          defaultMessage="Could not save, missing required field"
          description="Error message displayed when it's not possible to save metadata due to a required field not being filled in."
          id="metadata.couldNotSave"
        />
      ), 'error');
      return;
    }
    if (isAnyUrlInvalid()) {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Could not save, at least one URL is invalid"
          description="Error message displayed when a URL is not in the correct format in the form, which prevents the form from being saved."
          id="metadata.couldNotSaveUrl"
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

  // returns -1 when no annotations yet exist, null when in a loading state, and an object otherwise
  function getLatestEditInfo() {
    const noAnnotationsExist = tasks
      .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
      .filter(showMetadataItem)
      .every(task => task.node.first_response_value === null);
    if (noAnnotationsExist) {
      return -1;
    }
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
      latestAuthorDbid: latestAuthor.node?.first_response?.annotator?.user?.dbid,
      latestAuthorName: latestAuthor.node?.first_response?.annotator?.user?.name,
    };
  }

  const latestEditInfo = getLatestEditInfo();

  const LastEditedBy = () => {
    if (latestEditInfo === -1) {
      return null;
    } else if (latestEditInfo === null) {
      return <span>...</span>;
    }
    return (
      <div className={inputStyles['form-footer-actions-context']}>
        <FormattedMessage
          defaultMessage="Saved {timeAgo} by {userName}"
          description="This is a label that indicates when and by whom the task was saved."
          id="tasks.savedByLabel"
          values={{ timeAgo: moment(latestEditInfo.latestDate).fromNow(), userName: latestEditInfo.latestAuthorName }}
        />
      </div>
    );
  };

  output = (
    <>
      { media.archived === CheckArchivedFlags.TRASHED ?
        <div className={styles['empty-list']}>
          <FormattedMessage
            defaultMessage="Annotations unavailable"
            description="This message tells the user that the content typically shown in unavailable when the item is in the trash"
            id="tasks.contentTrash"
          />
        </div> :
        <>
          <div className={cx(inputStyles['form-inner-wrapper'], inputStyles['form-inner-sticky'])}>
            <div className={inputStyles['form-footer-actions']}>
              <LastEditedBy />
              {
                isEditing ? (
                  <>
                    <NavigateAwayDialog
                      body={
                        <FormattedMessage
                          defaultMessage="You are currently editing annotations. Do you wish to continue to a new page? Your work will not be saved."
                          description="This is a prompt that appears when a user tries to exit a page before saving their work."
                          id="tasks.confirmLeave"
                        />
                      }
                      hasUnsavedChanges
                      title={
                        <FormattedMessage
                          defaultMessage="Do you want to leave without saving?"
                          description="This is a prompt that appears when a user tries to exit a page before saving their work."
                          id="tasks.confirmLeaveTitle"
                        />
                      }
                    />
                    <ButtonMain
                      className="form-save"
                      label={
                        <FormattedMessage defaultMessage="Save" description="This is a label on a button at the top of a form. The label indicates that if the user presses this button, the user will save the changes they have been making in the form." id="metadata.form.save" />
                      }
                      size="default"
                      style={{ backgroundColor: 'var(--color-green-35)', color: 'var(--color-white-100)' }}
                      theme="validation"
                      variant="contained"
                      onClick={handleSaveAnnotations}
                    />
                    <ButtonMain
                      className="form-cancel"
                      label={
                        <FormattedMessage defaultMessage="Cancel" description="This is a label on a button that the user presses in order to revert/cancel any changes made to an unsaved form." id="metadata.form.cancel" />
                      }
                      size="default"
                      theme="lightText"
                      variant="text"
                      onClick={handleCancelAnnotations}
                    />
                  </>
                ) :
                  <ButtonMain
                    className="form-edit"
                    label={
                      <FormattedMessage defaultMessage="Edit Annotations" description="This is a label on a button that the user presses in order to edit the items in the attached form." id="metadata.form.edit" />
                    }
                    size="default"
                    theme="info"
                    variant="contained"
                    onClick={handleEditAnnotations}
                  />
              }
            </div>
          </div>
          <br />
          <ul className={cx('tasks__list', styles['media-item-annotations-list'])}>
            {tasks
              .filter(task => (!isBrowserExtension || task.node.show_in_browser_extension))
              .filter(showMetadataItem)
              .map(task => (
                <React.Fragment key={task.node.dbid}>
                  <li>
                    <Task about={about} isEditing={isEditing} localResponses={localResponses} media={media} setLocalResponses={setLocalResponses} task={task.node} />
                  </li>
                </React.Fragment>
              ))
            }
          </ul>
        </>
      }
    </>
  );

  return output;
};

export default withSetFlashMessage(injectIntl(Tasks));
