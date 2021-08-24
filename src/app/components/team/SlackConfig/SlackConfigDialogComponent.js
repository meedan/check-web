import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import LabelIcon from '@material-ui/icons/Label';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import MultiSelectFilter from '../../search/MultiSelectFilter';
import { safelyParseJSON } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';

const messages = defineMessages({
  defaultLabel: {
    id: 'slackConfigDialogComponent.defaultLabel',
    defaultMessage: 'Notification {number}',
    description: 'Default label for new notification. I.e.: Notification 1, Notification 2...',
  },
});

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

const AddEventButton = ({
  onSelect,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <React.Fragment>
      <Button onClick={e => setAnchorEl(e.currentTarget)}>
        <FormattedMessage
          id="slackConfigDialogComponent.addEvent"
          defaultMessage="+ Add event"
          description="Button label to event selector"
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="add-event__any-activity" onClick={() => onSelect('any_activity')}>
          <ListItemText
            primary={
              <FormattedMessage
                id="slackConfigDialogComponent.anyActivity"
                defaultMessage="Any workspace activity"
                description="Selecting this event will trigger notification upon any workspace activity"
              />
            }
          />
        </MenuItem>
        <MenuItem className="add-event__item-added" onClick={() => onSelect('item_added')}>
          <ListItemText
            primary={
              <FormattedMessage
                id="slackConfigDialogComponent.itemAdded"
                defaultMessage="Item is added to folder"
                description="Selecting this event will trigger notification whenever an item is added to or moved to a folder"
              />
            }
          />
        </MenuItem>
        <MenuItem className="add-event__status-changed" onClick={() => onSelect('status_changed')}>
          <ListItemText
            primary={
              <FormattedMessage
                id="slackConfigDialogComponent.statusChanged"
                defaultMessage="Status is changed to"
                description="Selecting this event will trigger notification whenever an item status is changed"
              />
            }
          />
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

const SlackConfigDialogComponent = ({
  intl,
  team,
  onCancel,
  setFlashMessage,
}) => {
  const projects = team.projects.edges.map(project => project.node);
  const { statuses } = team.verification_statuses;

  const classes = useStyles();
  const [webhook, setWebhook] = React.useState(team.slackWebhook || '');
  const [events, setEvents] = React.useState(team.slackNotifications || []);
  const [saving, setSaving] = React.useState(false);
  const [canSubmit, setCanSubmit] = React.useState(true);
  const [editIndex, setEditIndex] = React.useState(null);

  const isIfFilledIncorrectly = event => !event.event_type || (event.event_type && event.event_type !== 'any_activity' && !event.values.length);
  const isChannelFilledIncorrectly = event => !event.slack_channel.replace('#', '').trim();

  const validate = () => {
    let noError = true;
    events.forEach((e) => {
      if (isIfFilledIncorrectly(e) || isChannelFilledIncorrectly(e)) {
        noError = false;
      }
      setCanSubmit(noError);
    });
  };

  const handleAdd = () => {
    const newEvents = events.slice(0);
    newEvents.unshift({ label: '', values: [], slack_channel: '#' });
    setEvents(newEvents);
  };

  const handleRemove = (index) => {
    const newEvents = events.slice(0);
    newEvents.splice(index, 1);
    setEvents(newEvents);
  };

  const handleRemoveType = (index) => {
    const newEvents = events.slice(0);
    newEvents.splice(index, 1, { ...newEvents[index], event_type: null, values: [] });
    setEvents(newEvents);
  };

  const handleSetField = (i, field, value) => {
    const newEvents = events.slice(0);
    const event = { ...newEvents[i] };
    event[field] = field === 'slack_channel' && !value.startsWith('#') && !value.startsWith('@') ? `#${value}` : value;
    newEvents.splice(i, 1, event);
    setEvents(newEvents);
    setEditIndex(null);
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
    setFlashMessage(errorMessage, 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    onCancel();
    setFlashMessage(<FormattedMessage id="slackConfigDialogComponent.savedSuccessfully" defaultMessage="Slack settings saved successfully" />, 'success');
  };

  const handleSubmit = () => {
    if (canSubmit) {
      setSaving(true);
      // Save Slack team settings
      commitMutation(Store, {
        mutation: graphql`
          mutation SlackConfigDialogComponentUpdateTeamMutation($input: UpdateTeamInput!) {
            updateTeam(input: $input) {
              team {
                id
                slackWebhook: get_slack_webhook
                slackNotifications: get_slack_notifications
              }
            }
          }
        `,
        variables: {
          input: {
            id: team.id,
            slack_webhook: webhook,
            slack_notifications: JSON.stringify(events),
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
  };

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Skip first render
      return;
    }
    handleSubmit();
  }, [canSubmit]);

  return (
    <Box className={classes.root}>
      <Box display="flex" alignItems="center" className={[classes.header, classes.box].join(' ')}>
        <img src="/images/slack.svg" height="64" width="64" alt="Slack" />
        <Box className={classes.title}>
          <Typography variant="h6" component="div">Slack</Typography>
          <Typography variant="body1" component="div">
            <FormattedMessage
              id="slackConfigDialogComponent.title"
              defaultMessage="Send notifications to Slack channels when items are added to specific folders"
            />
          </Typography>
        </Box>
      </Box>

      <Box className={classes.box}>
        <TextField
          label={
            <FormattedMessage
              id="slackConfigDialogComponent.webhook"
              defaultMessage="Slack incoming webhook"
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
                  <Box mr={2} display="inline">
                    <FormattedMessage
                      id="slackConfigDialogComponent.notifications"
                      defaultMessage="Notifications"
                    />
                  </Box>
                  <Button
                    color="primary"
                    onClick={handleAdd}
                    size="small"
                    variant="contained"
                  >
                    <FormattedMessage id="slackConfigDialogComponent.new" defaultMessage="+ New" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { events.map((event, i) => (
                <TableRow key={Math.random().toString().substring(2, 10)}>
                  <TableCell>
                    { editIndex === i ?
                      <TextField
                        label={
                          <FormattedMessage
                            id="slackConfigDialogComponent.label"
                            defaultMessage="Notification name"
                          />
                        }
                        defaultValue={event.label || intl.formatMessage(messages.defaultLabel, { number: i + 1 })}
                        onBlur={(e) => { handleSetField(i, 'label', e.target.value); }}
                        size="small"
                        margin="normal"
                        variant="outlined"
                      />
                      :
                      <div>
                        { event.label || intl.formatMessage(messages.defaultLabel, { number: i + 1 }) }
                        <IconButton onClick={() => setEditIndex(i)}>
                          <EditIcon className={classes.icon} />
                        </IconButton>
                        <IconButton onClick={() => { handleRemove(i); }}>
                          <DeleteIcon className={classes.icon} />
                        </IconButton>
                      </div>
                    }
                    <Box display="flex" alignItems="center">
                      <FormattedMessage
                        id="slackConfigDialogComponent.if"
                        defaultMessage="If"
                        description="Header to event selector. E.g.: If 'Item is added to' ..."
                      />
                      <span style={{ width: '16px' }} />
                      { event.event_type === 'item_added' ?
                        <FormattedMessage
                          id="slackConfigDialogComponent.itemIsAddedTo"
                          defaultMessage="Item is added to"
                          description="Label to folder selector component"
                        >
                          { label => (
                            <MultiSelectFilter
                              label={label}
                              icon={<FolderOpenIcon />}
                              selected={event.values}
                              options={projects
                                .sort((a, b) => (a.title.localeCompare(b.title)))
                                .map(p => ({ label: p.title, value: p.dbid.toString() }))
                              }
                              onChange={val => handleSetField(i, 'values', val)}
                              onRemove={() => handleRemoveType(i)}
                            />
                          )}
                        </FormattedMessage>
                        : null }
                      { event.event_type === 'any_activity' ?
                        <FormattedMessage
                          id="slackConfigDialogComponent.anyActivity"
                          defaultMessage="Any workspace activity"
                          description="Selecting this event will trigger notification upon any workspace activity"
                        /> : null
                      }
                      { event.event_type === 'status_changed' ?
                        <FormattedMessage
                          id="slackConfigDialogComponent.statusChanged"
                          defaultMessage="Status is changed to"
                          description="Selecting this event will trigger notification whenever an item status is changed"
                        >
                          { label => (
                            <MultiSelectFilter
                              label={label}
                              icon={<LabelIcon />}
                              selected={event.values}
                              options={statuses.map(s => ({ label: s.label, value: s.id }))}
                              onChange={val => handleSetField(i, 'values', val)}
                              onRemove={() => handleRemoveType(i)}
                            />
                          )}
                        </FormattedMessage>
                        : null }
                      { !event.event_type ?
                        <AddEventButton onSelect={val => handleSetField(i, 'event_type', val)} />
                        : null }
                    </Box>
                    { !canSubmit && isIfFilledIncorrectly(event) ?
                      <Box color="error.main" my={1}>
                        <FormattedMessage
                          id="slackConfigDialogComponent.noConditionError"
                          defaultMessage="Please select a condition to send notifications"
                        />
                      </Box>
                      : null
                    }
                    <Box display="flex" alignItems="center" mt={2} whiteSpace="nowrap">
                      <FormattedMessage
                        id="slackConfigDialogComponent.then"
                        defaultMessage="Then send notification to"
                        description="Header to notification destination input. E.g.: Then send notification to '#general'"
                      />
                      <span style={{ width: '16px' }} />
                      <TextField
                        label={
                          <FormattedMessage
                            id="slackConfigDialogComponent.channel"
                            defaultMessage="Slack channel"
                          />
                        }
                        defaultValue={event.slack_channel}
                        onBlur={(e) => { handleSetField(i, 'slack_channel', e.target.value); }}
                        size="small"
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
                    { !canSubmit && isChannelFilledIncorrectly(event) ?
                      <Box color="error.main" my={1}>
                        <FormattedMessage
                          id="slackConfigDialogComponent.noChannelError"
                          defaultMessage="Please add the Slack channel where notifications will be sent"
                        />
                      </Box>
                      : null
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box className={classes.footer} display="flex" justifyContent="flex-end">
          <Button onClick={handleCancel}>
            <FormattedMessage id="slackConfigDialogComponent.cancel" defaultMessage="Cancel" />
          </Button>
          <Button color="primary" variant="contained" onClick={validate} disabled={saving} className="slack-config__save">
            <FormattedMessage id="slackConfigDialogComponent.save" defaultMessage="Save" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

SlackConfigDialogComponent.propTypes = {
  intl: intlShape.isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slackWebhook: PropTypes.string,
    slackNotifications: PropTypes.array.isRequired,
    verification_statuses: PropTypes.object.isRequired,
    projects: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        dbid: PropTypes.number,
        title: PropTypes.string,
      })),
    }),
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(injectIntl(SlackConfigDialogComponent)), graphql`
  fragment SlackConfigDialogComponent_team on Team {
    id
    slackWebhook: get_slack_webhook
    slackNotifications: get_slack_notifications
    verification_statuses
    projects(first: 10000) {
      edges {
        node {
          id
          dbid
          title
        }
      }
    }
  }
`);
