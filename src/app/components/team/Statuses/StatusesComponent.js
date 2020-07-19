import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import DeleteStatusDialog from './DeleteStatusDialog';
import EditStatusDialog from './EditStatusDialog';
import StatusListItem from './StatusListItem';
import TranslateStatuses from './TranslateStatuses';
import LanguageSwitcher from '../../LanguageSwitcher';
import { stringHelper } from '../../../customHelpers';
import { getErrorMessage } from '../../../helpers';
import { checkBlue, ContentColumn, units } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    flex: '1 1 100%',
    alignSelf: 'center',
  },
  button: {
    whiteSpace: 'nowrap',
  },
  helpIcon: {
    color: checkBlue,
  },
}));

const StyledBlurb = styled.div`
  margin-top: ${units(4)};
`;

const StatusesComponent = ({ team, setFlashMessage }) => {
  const statuses = [...team.verification_statuses.statuses];
  const defaultStatusId = team.verification_statuses.default;
  const defaultLanguage = team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [addingNewStatus, setAddingNewStatus] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [deleteStatus, setDeleteStatus] = React.useState(null);
  const classes = useToolbarStyles();

  const handleError = (error) => {
    const fallbackMessage = (
      <FormattedMessage
        id="statusesComponent.error"
        defaultMessage="Sorry, an error occurred while updating the statuses. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(error, fallbackMessage);
    setFlashMessage(message);
  };

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
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
              verification_statuses_with_counters: verification_statuses(items_count: true, published_reports_count: true)
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
              verification_statuses_with_counters: verification_statuses(items_count: true, published_reports_count: true)
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

  const handleHelp = () => {
    window.open('https://help.checkmedia.org/en/articles/4235955-status-settings');
  };

  const handleDelete = ({ status_id, fallback_status_id }) => {
    const onCompleted = (response, error) => {
      if (error) {
        handleError(error);
      }
      setDeleteStatus(null);
    };
    const onError = (error) => {
      handleError(error);
      setDeleteStatus(null);
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
    const onCompleted = (response, error) => {
      if (error) {
        handleError(error);
      }
      setAddingNewStatus(false);
      setSelectedStatus(null);
      if (showSuccessMessage) {
        setFlashMessage((
          <FormattedMessage
            id="statusesComponent.saved"
            defaultMessage="Statuses saved sucessfully!"
          />
        ));
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
    const newStatusesArray = [...newStatuses.statuses];

    if (selectedStatus && (status.id === selectedStatus.id)) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1, status);
    } else {
      newStatusesArray.push(status);
    }

    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses);
  };

  const handleCancelEdit = () => {
    setAddingNewStatus(false);
    setSelectedStatus(null);
  };

  const handleMenuDelete = (status) => {
    const statusWithCounters =
      team.verification_statuses_with_counters.statuses.find(t => t.id === status.id);
    if (statusWithCounters.items_count) {
      setDeleteStatus(statusWithCounters);
    } else {
      handleDelete({ status_id: status.id, fallback_status_id: '' });
    }
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
    handleSubmit(newStatuses, true);
  };

  return (
    <React.Fragment>
      <ContentColumn large>
        <Card>
          <CardContent>
            <Toolbar className={classes.root}>
              <Box display="flex" justifyContent="center">
                <Typography className={classes.title} color="inherit" variant="h6" component="div">
                  <FormattedMessage
                    id="statusesComponent.title"
                    defaultMessage="{statuses_count, plural, one {1 status} other {# statuses}}"
                    values={{ statuses_count: statuses.length }}
                  />
                </Typography>
                <IconButton onClick={handleHelp}>
                  <HelpIcon className={classes.helpIcon} />
                </IconButton>
              </Box>
              <Button className={[classes.button, 'team-statuses__add-button'].join(' ')} color="primary" variant="contained" onClick={() => setAddingNewStatus(true)}>
                <FormattedMessage
                  id="statusesComponent.newStatus"
                  defaultMessage="New status"
                />
              </Button>
            </Toolbar>
            <LanguageSwitcher
              primaryLanguage={defaultLanguage}
              currentLanguage={currentLanguage}
              languages={languages}
              onChange={handleChangeLanguage}
            />
            {
              currentLanguage === defaultLanguage ? (
                <React.Fragment>
                  <StyledBlurb>
                    <FormattedMessage
                      id="statusesComponent.blurb"
                      defaultMessage="The status title is visible when reports are sent to users."
                    />
                  </StyledBlurb>
                  <List>
                    { statuses.map(s => (
                      <StatusListItem
                        defaultLanguage={defaultLanguage}
                        isDefault={s.id === defaultStatusId}
                        key={s.id}
                        onDelete={handleMenuDelete}
                        onEdit={handleMenuEdit}
                        onMakeDefault={handleMenuMakeDefault}
                        preventDelete={statuses.length === 1}
                        status={s}
                      />
                    ))}
                  </List>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <StyledBlurb>
                    <FormattedMessage
                      id="statusesComponent.blurbSecondary"
                      defaultMessage="Translate statuses in secondary languages in order to display them in local languages in your fact checking reports."
                    />
                  </StyledBlurb>
                  <TranslateStatuses
                    currentLanguage={currentLanguage}
                    defaultLanguage={defaultLanguage}
                    key={currentLanguage}
                    onSubmit={handleTranslateStatuses}
                    statuses={statuses}
                  />
                </React.Fragment>
              )
            }
          </CardContent>
        </Card>
      </ContentColumn>
      <EditStatusDialog
        defaultLanguage={defaultLanguage}
        defaultValue={selectedStatus}
        key={selectedStatus}
        onCancel={handleCancelEdit}
        onSubmit={handleAddOrEditStatus}
        open={addingNewStatus || Boolean(selectedStatus)}
      />
      <DeleteStatusDialog
        defaultValue={deleteStatus}
        key={deleteStatus}
        open={Boolean(deleteStatus)}
        onCancel={() => setDeleteStatus(null)}
        onProceed={handleDelete}
        statuses={statuses}
      />
    </React.Fragment>
  );
};

StatusesComponent.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object,
    get_language: PropTypes.string,
    get_languages: PropTypes.string,
  }).isRequired,
};

export default withSetFlashMessage(StatusesComponent);
