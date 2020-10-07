import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import ForwardIcon from '@material-ui/icons/Forward';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import { safelyParseJSON } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 800,
  },
  header: {
    backgroundColor: '#F6F6F6',
  },
  icon: {
    color: '#979797',
  },
  box: {
    padding: theme.spacing(2),
  },
  spacing: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  footer: {
    marginTop: theme.spacing(5),
  },
}));

// For now, we just want to show on the UI
// events of type "item_added"
function eventsFromProjects(projects) {
  const events = [];
  projects.forEach((project) => {
    if (project.get_slack_events) {
      project.get_slack_events.forEach((event) => {
        if (event.event === 'item_added') {
          events.push({ projectId: project.id, channelName: event.slack_channel });
        }
      });
    }
  });
  return events;
}

const updateProjectMutation = graphql`
  mutation SlackConfigDialogComponentUpdateProjectMutation($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      project {
        id
        get_slack_events
      }
    }
  }
`;

const SlackConfigDialogComponent = ({ team, onCancel, setFlashMessage }) => {
  const projects = team.projects.edges.map(project => project.node);

  const classes = useStyles();
  const [webhook, setWebhook] = React.useState(team.slackWebhook || '');
  const [channel, setChannel] = React.useState(team.slackChannel || '#');
  const [events, setEvents] = React.useState(eventsFromProjects(projects));
  const [saving, setSaving] = React.useState(false);

  const handleAdd = () => {
    const newEvents = events.slice(0);
    newEvents.push({ projectId: '', channelName: '#' });
    setEvents(newEvents);
  };

  const handleRemove = (i) => {
    let newEvents = events.slice(0);
    const event = events[i];
    if (event.projectId) {
      commitMutation(Store, {
        mutation: updateProjectMutation,
        variables: {
          input: {
            id: event.projectId,
            slack_events: '[]',
          },
        },
      });
    }
    newEvents.splice(i, 1);
    if (newEvents.length === 0) {
      newEvents = [{ projectId: '', channelName: '#' }];
    }
    setEvents(newEvents);
  };

  const handleSetField = (i, field, value) => {
    const newEvents = events.slice(0);
    newEvents[i][field] = value;
    setEvents(newEvents);
  };

  const handleCancel = () => {
    onCancel();
  };

  // FIXME: Define this function somewhere else and reuse across components
  const handleError = (error) => {
    setSaving(false);
    let errorMessage = <FormattedMessage id="slackConfigDialogComponent.defaultErrorMessage" defaultMessage="Could not save Slack settings" />;
    const json = safelyParseJSON(error.source);
    if (json && json.errors && json.errors[0] && json.errors[0].message) {
      errorMessage = json.errors[0].message;
    }
    setFlashMessage(errorMessage);
  };

  const handleSuccess = () => {
    setSaving(false);
    onCancel();
    setFlashMessage(<FormattedMessage id="slackConfigDialogComponent.savedSuccessfully" defaultMessage="Slack settings saved successfully!" />);
  };

  const handleSubmit = () => {
    setSaving(true);

    // Save Slack team settings
    commitMutation(Store, {
      mutation: graphql`
        mutation SlackConfigDialogComponentUpdateTeamMutation($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              id
              slackWebhook: get_slack_webhook
              slackChannel: get_slack_channel
            }
          }
        }
      `,
      variables: {
        input: {
          id: team.id,
          slack_webhook: webhook,
          slack_channel: channel,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          handleSuccess();
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });

    // Save Slack settings for each project
    events.forEach((event) => {
      if (event.projectId && event.channelName) {
        commitMutation(Store, {
          mutation: updateProjectMutation,
          variables: {
            input: {
              id: event.projectId,
              slack_events: JSON.stringify([{
                event: 'item_added',
                slack_channel: event.channelName,
              }]),
            },
          },
          onCompleted: (response, error) => {
            if (error) {
              handleError(error);
            } else {
              handleSuccess();
            }
          },
          onError: (error) => {
            handleError(error);
          },
        });
      }
    });
  };

  return (
    <Box className={classes.root}>
      <Box display="flex" alignItems="center" className={[classes.header, classes.box].join(' ')}>
        <img src="/images/slack.svg" height="64" width="64" alt="Slack" />
        <Box className={classes.title}>
          <Typography variant="h6" component="div">Slack</Typography>
          <Typography variant="body1" component="div">
            <FormattedMessage
              id="slackConfigDialogComponent.title"
              defaultMessage="Send notifications to Slack channels when claims are added to specific lists"
            />
          </Typography>
        </Box>
      </Box>

      <Box className={classes.box}>
        <TextField
          label={
            <FormattedMessage
              id="slackConfigDialogComponent.webhook"
              defaultMessage="Slack webhook"
            />
          }
          id="slack-config__webhook"
          value={webhook}
          onChange={(e) => { setWebhook(e.target.value); }}
          variant="outlined"
          className={classes.spacing}
          fullWidth
        />

        <TableContainer className={classes.spacing}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage
                    id="slackConfigDialogComponent.event"
                    defaultMessage="Event"
                  />
                </TableCell>
                <TableCell><ForwardIcon className={classes.icon} /></TableCell>
                <TableCell>
                  <FormattedMessage
                    id="slackConfigDialogComponent.sendNotificationsTo"
                    defaultMessage="Send notifications to"
                  />
                </TableCell>
                <TableCell>{' '}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <FormattedMessage
                    id="slackConfigDialogComponent.allActivity"
                    defaultMessage="All workspace activity"
                  />
                </TableCell>
                <TableCell><ForwardIcon className={classes.icon} /></TableCell>
                <TableCell>
                  <TextField
                    label={
                      <FormattedMessage
                        id="slackConfigDialogComponent.channel"
                        defaultMessage="Slack channel"
                      />
                    }
                    id="slack-config__channel"
                    value={channel}
                    onChange={(e) => { setChannel(e.target.value); }}
                    variant="outlined"
                    fullWidth
                  />
                </TableCell>
                <TableCell>{' '}</TableCell>
              </TableRow>
              { events.map((event, i) => (
                <TableRow key={Math.random().toString().substring(2, 10)}>
                  <TableCell>
                    <Autocomplete
                      value={projects.find(project => project.id === event.projectId) || {}}
                      onChange={(e, newValue) => {
                        if (newValue) {
                          handleSetField(i, 'projectId', newValue.id);
                        }
                      }}
                      options={projects.sort((a, b) => (a.title.localeCompare(b.title)))}
                      getOptionLabel={project => (project.title || '')}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={
                            <FormattedMessage
                              id="slackConfigDialogComponent.ifItemAddedTo"
                              defaultMessage="If item is added to"
                            />
                          }
                          variant="outlined"
                          fullWidth
                        />
                      )}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell><ForwardIcon className={classes.icon} /></TableCell>
                  <TableCell>
                    <TextField
                      label={
                        <FormattedMessage
                          id="slackConfigDialogComponent.channel"
                          defaultMessage="Slack channel"
                        />
                      }
                      defaultValue={event.channelName}
                      onBlur={(e) => { handleSetField(i, 'channelName', e.target.value); }}
                      variant="outlined"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => { handleRemove(i); }}>
                      <CancelOutlinedIcon className={classes.icon} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button color="primary" variant="contained" onClick={handleAdd}>
          <FormattedMessage id="slackConfigDialogComponent.new" defaultMessage="New notification" />
        </Button>
        <Box className={classes.footer} display="flex" justifyContent="flex-end">
          <Button onClick={handleCancel}>
            <FormattedMessage id="slackConfigDialogComponent.cancel" defaultMessage="Cancel" />
          </Button>
          <Button color="primary" variant="contained" onClick={handleSubmit} disabled={saving}>
            <FormattedMessage id="slackConfigDialogComponent.save" defaultMessage="Save" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

SlackConfigDialogComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slackChannel: PropTypes.string,
    slackWebhook: PropTypes.string,
    projects: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        dbid: PropTypes.number,
        title: PropTypes.string,
        get_slack_events: PropTypes.arrayOf(PropTypes.shape({
          event: PropTypes.string,
          channel_name: PropTypes.string,
        })),
      })),
    }),
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(SlackConfigDialogComponent);
