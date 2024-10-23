/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import cx from 'classnames/bind';
import DeleteStatusDialog from './DeleteStatusDialog';
import EditStatusDialog from './EditStatusDialog';
import StatusListItem from './StatusListItem';
import TranslateStatuses from './TranslateStatuses';
import SettingsHeader from '../SettingsHeader';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { stringHelper } from '../../../customHelpers';
import { getErrorMessage } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';
import settingsStyles from '../Settings.module.css';

const StatusesComponent = ({ setFlashMessage, team }) => {
  const defaultStatusId = team.verification_statuses.default;
  const defaultLanguage = team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const [statuses, setStatuses] = React.useState([...team.verification_statuses.statuses]);
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [addingNewStatus, setAddingNewStatus] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [showDeleteStatusDialogFor, setShowDeleteStatusDialogFor] = React.useState(null);

  const handleError = (error) => {
    const fallbackMessage = (
      <FormattedMessage
        defaultMessage="Sorry, an error occurred while updating the statuses. Please try again and contact {supportEmail} if the condition persists."
        description="Error message displayed when status can't be changed."
        id="statusesComponent.error"
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(error, fallbackMessage);
    setFlashMessage(message, 'error');
  };

  const handleChangeLanguage = (newValue) => {
    const { languageCode } = newValue;
    setCurrentLanguage(languageCode);
  };

  const handleMenuEdit = (status) => {
    setSelectedStatus(status);
  };

  function submitUpdateStatuses({ input, onCompleted, onError }) {
    commitMutation(Store, {
      mutation: graphql`
        mutation StatusesComponentUpdateTeamMutation($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              id
              verification_statuses
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted,
      onError,
    });
  }

  function submitDeleteStatus({ input, onCompleted, onError }) {
    commitMutation(Store, {
      mutation: graphql`
        mutation StatusesComponentDeleteTeamStatusMutation($input: DeleteTeamStatusInput!) {
          deleteTeamStatus(input: $input) {
            team {
              id
              verification_statuses
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted,
      onError,
    });
  }

  const handleDelete = ({ fallback_status_id, status_id }) => {
    const onCompleted = () => {
      setStatuses(statuses.filter(s => s.id !== status_id));
      setShowDeleteStatusDialogFor(null);
      setSelectedStatus(null);
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Status deleted successfully"
          description="Success message displayed when status is deleted."
          id="statusesComponent.deleted"
        />
      ), 'success');
    };
    const onError = (error) => {
      handleError(error);
      setShowDeleteStatusDialogFor(null);
    };
    submitDeleteStatus({
      input: {
        team_id: team.id,
        status_id,
        fallback_status_id,
      },
      onCompleted,
      onError,
    });
  };

  const handleSubmit = (newStatuses, showSuccessMessage) => {
    const onCompleted = () => {
      setAddingNewStatus(false);
      setSelectedStatus(null);
      if (showSuccessMessage === 'saved') {
        setFlashMessage((
          <FormattedMessage
            defaultMessage="Statuses saved successfully"
            description="Success message displayed when status is saved."
            id="statusesComponent.saved"
          />
        ), 'success');
      }
      if (showSuccessMessage === 'created') {
        setFlashMessage((
          <FormattedMessage
            defaultMessage="Status created successfully"
            description="Success message displayed when status is created."
            id="statusesComponent.created"
          />
        ), 'success');
      }
    };
    const onError = (error) => {
      handleError(error);
      setAddingNewStatus(false);
      setSelectedStatus(null);
    };
    submitUpdateStatuses({
      input: {
        id: team.id,
        media_verification_statuses: JSON.stringify(newStatuses),
      },
      onCompleted,
      onError,
    });
  };

  const handleAddOrEditStatus = (status) => {
    const newStatuses = { ...team.verification_statuses };
    const newStatusesArray = [...statuses];

    if (selectedStatus && (status.id === selectedStatus.id)) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1, status);
    } else {
      newStatusesArray.push(status);
      setSelectedStatus(null);
    }

    newStatuses.statuses = newStatusesArray;
    setStatuses(newStatusesArray);
    handleSubmit(newStatuses, (addingNewStatus ? 'created' : null));
  };

  const handleCancelEdit = () => {
    setAddingNewStatus(false);
    setSelectedStatus(null);
  };

  const handleMenuDelete = (status) => {
    setShowDeleteStatusDialogFor(status.id);
  };

  const handleMenuMakeDefault = (status) => {
    const newStatuses = { ...team.verification_statuses };
    const newStatusesArray = [...newStatuses.statuses];

    if (status.id) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1);
      newStatusesArray.unshift(status);
      newStatuses.default = status.id;
    }

    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses);
  };

  const handleTranslateStatuses = (newStatusesArray) => {
    const newStatuses = { ...team.verification_statuses };
    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses, 'saved');
  };

  return (
    <>
      <SettingsHeader
        actionButton={
          <ButtonMain
            className="team-statuses__add-button"
            label={
              <FormattedMessage
                defaultMessage="New status"
                description="Button label to create a new status."
                id="statusesComponent.newStatus"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={() => setAddingNewStatus(true)}
          />
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Statuses represent the position of claims in the editorial workflow. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about statuses</a>.'
            description="Context description for the functionality of this page"
            id="statusesComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/3623387-item-status' }}
          />
        }
        extra={
          languages.length > 1 ?
            <LanguagePickerSelect
              languages={languages}
              selectedLanguage={currentLanguage}
              onSubmit={handleChangeLanguage}
            /> : null
        }
        title={
          <FormattedMessage
            defaultMessage="Statuses [{statusCount}]"
            description="The idea of this sentence is 'statuses written in language <languageName>'"
            id="statusesComponent.title"
            values={{
              statusCount: statuses.length,
            }}
          />
        }
      />
      <div className={cx('status-settings', settingsStyles['setting-details-wrapper'])}>
        <div className={cx(settingsStyles['setting-content-container'])}>
          {
            currentLanguage === defaultLanguage ? (
              <ul className={settingsStyles['setting-content-list']} key={statuses.length}>
                { statuses.map(s => (
                  <StatusListItem
                    defaultLanguage={defaultLanguage}
                    isDefault={s.id === defaultStatusId}
                    key={s.id}
                    preventDelete={statuses.length === 1}
                    status={s}
                    onDelete={handleMenuDelete}
                    onEdit={handleMenuEdit}
                    onMakeDefault={handleMenuMakeDefault}
                  />
                ))}
              </ul>
            ) : (
              <React.Fragment>
                <FormattedMessage
                  defaultMessage="Translate statuses in secondary languages to display them to tipline users in their conversation language."
                  description="Message displayed on status translation page."
                  id="statusesComponent.blurbSecondary"
                  tagName="p"
                />
                <TranslateStatuses
                  currentLanguage={currentLanguage}
                  defaultLanguage={defaultLanguage}
                  key={currentLanguage}
                  statuses={statuses}
                  onSubmit={handleTranslateStatuses}
                />
              </React.Fragment>
            )
          }
        </div>
        <EditStatusDialog
          defaultLanguage={defaultLanguage}
          defaultValue={selectedStatus}
          key={selectedStatus || 'edit-status-dialog'}
          open={addingNewStatus || Boolean(selectedStatus)}
          team={team}
          onCancel={handleCancelEdit}
          onSubmit={handleAddOrEditStatus}
        />
        { showDeleteStatusDialogFor ?
          <DeleteStatusDialog
            defaultValue={showDeleteStatusDialogFor}
            key={showDeleteStatusDialogFor || 'delete-status-dialog'}
            open
            statuses={statuses}
            onCancel={() => setShowDeleteStatusDialogFor(null)}
            onProceed={handleDelete}
          /> : null }
      </div>
    </>
  );
};

StatusesComponent.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(StatusesComponent);
