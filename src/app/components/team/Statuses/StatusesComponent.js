import React from 'react';
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

import StatusListItem from './StatusListItem';
import EditStatusDialog from './EditStatusDialog';
import TranslateStatuses from './TranslateStatuses';
import LanguageSwitcher from '../../LanguageSwitcher';
import { checkBlue, ContentColumn, units } from '../../../styles/js/shared';

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

const StatusesComponent = ({ team }) => {
  const statuses = [...team.verification_statuses.statuses];
  // console.log('statuses', statuses);
  const defaultLanguage = team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editStatus, setEditStatus] = React.useState(null);
  const classes = useToolbarStyles();

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
  };

  const handleEdit = (status) => {
    setEditStatus(status);
    setDialogOpen(true);
  };

  const handleHelp = () => {};

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

  const handleAddOrEditStatus = (status) => {
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

  const handleTranslateStatuses = (newStatusesArray) => {
    const newStatuses = { ...team.verification_statuses };
    newStatuses.statuses = newStatusesArray;
    // console.log('newStatuses', newStatuses);
    // console.log('newStatusesArray', newStatusesArray);
    handleUpdateStatuses(newStatuses);
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
              <Button className={classes.button} color="primary" variant="contained" onClick={() => setDialogOpen(true)}>
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
                    { statuses.map((s, index) => (
                      <StatusListItem
                        default={index === 0}
                        defaultLanguage={defaultLanguage}
                        key={s.id}
                        onEdit={() => handleEdit(s)}
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
        key={editStatus}
        onDismiss={() => setDialogOpen(false)}
        onSubmit={handleAddOrEditStatus}
        open={dialogOpen}
        status={editStatus}
      />
    </React.Fragment>
  );
};

export default StatusesComponent;
