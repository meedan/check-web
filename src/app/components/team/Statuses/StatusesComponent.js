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
import LanguageSwitcher from '../../LanguageSwitcher';
import { ContentColumn } from '../../../styles/js/shared';


const StatusesComponent = (props) => {
  const { team } = props;
  const statuses = [...team.verification_statuses.statuses];
  console.log('team', team);
  console.log('statuses', statuses);
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
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
        console.log('response', response);
        console.error('error', error);
        setMenuOpen(false);
      },
      onError: (error) => {
        console.error('error', error);
      },
    });
  };

  // const model = {
  //   label: 'Custom Status',
  //   default: 'initial',
  //   active: 'ongoing',
  //   statuses: [
  //     {
  //       id: 'initial',
  //       style: { color: 'coral' },
  //       locales: {
  //         en: {
  //           label: 'Initial',
  //           description: 'Initial',
  //         },
  //         pt: {
  //           label: 'Inicial',
  //           description: 'Inicial',
  //         },
  //         fr: {
  //           label: 'Initiale',
  //           description: 'Initiale',
  //         },
  //         es: {
  //           label: 'Primero',
  //           description: 'Primero',
  //         },
  //       },
  //     },
  //     {
  //       id: 'ongoing',
  //       style: { color: 'gold' },
  //       locales: {
  //         en: {
  //           label: 'On Going',
  //           description: 'On Going',
  //         },
  //         pt: {
  //           label: 'Ainda Em Andamento',
  //           description: 'Em Andamento',
  //         },
  //         fr: {
  //           label: 'Continu',
  //           description: 'Continu',
  //         },
  //         es: {
  //           label: 'En Marcha',
  //           description: 'En Marcha',
  //         },
  //       },
  //     },
  //     {
  //       id: 'done',
  //       style: { color: 'indigo' },
  //       locales: {
  //         en: {
  //           label: 'Done',
  //           description: 'Done',
  //         },
  //         pt: {
  //           label: 'Feito',
  //           description: 'Feito',
  //         },
  //         fr: {
  //           label: 'Fini',
  //           description: 'Fini',
  //         },
  //         es: {
  //           label: 'Hecho',
  //           description: 'Hecho',
  //         },
  //       },
  //     },
  //   ],
  // };

  const handleAddStatus = (newStatus) => {
    const newStatuses = { ...props.team.verification_statuses };
    const obj = {
      // description: newStatus.statusDescription,
      id: newStatus.statusName,
      // label: newStatus.statusName,
      style: {
        backgroundColor: '#72d18d',
        color: '#5cae73',
      },
      locales: {},
    };
    obj.locales[defaultLanguage] = {
      description: newStatus.statusDescription,
      label: newStatus.statusName,
    };
    const arr = [...newStatuses.statuses, obj];
    newStatuses.statuses = arr;

    console.log('newStatuses', newStatuses);
    handleUpdateStatuses(newStatuses);
  };

  return (
    <React.Fragment>
      <ContentColumn>
        <Card>
          <CardContent>
            <Button color="primary" variant="contained" onClick={() => setMenuOpen(true)}>
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
            <List>
              { statuses.map(s => (
                <StatusListItem
                  key={s.id}
                  status={s}
                  defaultLanguage={defaultLanguage}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </ContentColumn>
      <EditStatusDialog
        open={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        onSubmit={handleAddStatus}
      />
    </React.Fragment>
  );
};

export default StatusesComponent;
