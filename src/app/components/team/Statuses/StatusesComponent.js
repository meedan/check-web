import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import StatusListItem from './StatusListItem';
import EditStatusDialog from './EditStatusDialog';
import TranslateStatus from './TranslateStatus';
import LanguageSwitcher from '../../LanguageSwitcher';
import { ContentColumn } from '../../../styles/js/shared';

const StatusesComponent = ({ team }) => {
  const statuses = [...team.verification_statuses.statuses];
  const defaultLanguage = team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editStatus, setEditStatus] = React.useState(null);

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
  };

  const handleEdit = (status) => {
    setEditStatus(status);
    setDialogOpen(true);
  };

  const handleUpdateStatuses = (newStatuses) => {
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
        input: {
          id: team.id,
          media_verification_statuses: JSON.stringify(newStatuses),
        },
      },
      onCompleted: (response, error) => {
        if (error) console.error('error', error); // TODO handle error
        setDialogOpen(false);
      },
      onError: (error) => {
        console.error('error', error); // TODO handle error
      },
    });
  };

  const handleAddStatus = (status) => {
    const newStatuses = { ...team.verification_statuses };
    const newStatusesArray = [...newStatuses.statuses];

    if (status.id) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1, status);
    } else {
      newStatusesArray.push(status);
    }

    newStatuses.statuses = newStatusesArray;

    handleUpdateStatuses(newStatuses);
  };

  return (
    <React.Fragment>
      <ContentColumn>
        <Card>
          <CardContent>
            <Button color="primary" variant="contained" onClick={() => setDialogOpen(true)}>
              <FormattedMessage
                id="statusesComponent.newStatus"
                defaultMessage="New status"
              />
            </Button>
            <LanguageSwitcher
              primaryLanguage={defaultLanguage}
              currentLanguage={currentLanguage}
              languages={languages}
              onChange={handleChangeLanguage}
            />
            {
              currentLanguage === defaultLanguage ? (
                <List>
                  { statuses.map(s => (
                    <StatusListItem
                      defaultLanguage={defaultLanguage}
                      key={s.id}
                      onEdit={() => handleEdit(s)}
                      status={s}
                    />
                  ))}
                </List>
              ) : (
                <TranslateStatus
                  statuses={statuses}
                  defaultLanguage={defaultLanguage}
                  currentLanguage={currentLanguage}
                />
              )
            }
          </CardContent>
        </Card>
      </ContentColumn>
      <EditStatusDialog
        defaultLanguage={defaultLanguage}
        key={editStatus}
        onDismiss={() => setDialogOpen(false)}
        onSubmit={handleAddStatus}
        open={dialogOpen}
        status={editStatus}
      />
    </React.Fragment>
  );
};

export default StatusesComponent;
