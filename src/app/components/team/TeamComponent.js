import React, {Component, PropTypes} from 'react';
import Relay from 'react-relay';
import PageTitle from '../PageTitle';
import MappedMessage from '../MappedMessage';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Tags from './Tags';
import {Link} from 'react-router';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import MdCreate from 'react-icons/lib/md/create';
import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import MDEdit from 'react-icons/lib/md/edit';
import MDChevronRight from 'react-icons/lib/md/chevron-right';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';
import CreateContactMutation from '../../relay/CreateContactMutation';
import UpdateContactMutation from '../../relay/UpdateContactMutation';
import CreateProject from '../project/CreateProject';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import {bemClass} from '../../helpers';

const messages = defineMessages({
  editError: {
    id: 'teamComponent.editError',
    defaultMessage: 'Sorry, could not edit the team',
  },
  editSuccess: {
    id: 'teamComponent.editSuccess',
    defaultMessage: 'Team information updated successfully!',
  },
  changeAvatar: {
    id: 'teamComponent.changeAvatar',
    defaultMessage: "You can't change this right now, but we're hard at work to enable it soon!",
  },
  teamName: {
    id: 'teamComponent.teamName',
    defaultMessage: 'Team name',
  },
  teamDescription: {
    id: 'teamComponent.teamDescription',
    defaultMessage: 'Team description',
  },
  location: {
    id: 'teamComponent.location',
    defaultMessage: 'Location',
  },
  phone: {
    id: 'teamComponent.phone',
    defaultMessage: 'Phone number',
  },
  website: {
    id: 'teamComponent.website',
    defaultMessage: 'Website',
  },
  slackWebhook: {
    id: 'teamComponent.slackWebhook',
    defaultMessage: 'Slack webhook',
  },
  slackChannel: {
    id: 'teamComponent.slackChannel',
    defaultMessage: 'Slack default #channel',
  },
  verificationTeam: {
    id: 'teamComponent.verificationTeam',
    defaultMessage: 'Verification Team',
  },
  bridge_verificationTeam: {
    id: 'bridge.teamComponent.verificationTeam',
    defaultMessage: 'Translation Team',
  },
  verificationProjects: {
    id: 'teamComponent.title',
    defaultMessage: 'Verification Projects',
  },
  bridge_verificationProjects: {
    id: 'bridge.teamComponent.title',
    defaultMessage: 'Translation Projects',
  },
});

class TeamComponent extends Component {
  constructor(props) {
    super(props);
    const team = this.props.team, contact = team.contacts.edges[0] || {node: {}};
    this.state = {
      message: null,
      isEditing: false,
      submitDisabled: false,
      values: {
        name: team.name,
        description: team.description,
        slackNotificationsEnabled: team.get_slack_notifications_enabled,
        slackWebhook: team.get_slack_webhook,
        slackChannel: team.get_slack_channel,
        contact_location: contact.node.location,
        contact_phone: contact.node.phone,
        contact_web: contact.node.web,
      },
    };
  }

  setContextTeam() {
    const context = new CheckContext(this);
    const store = context.getContextStore();
    const team = this.props.team;

    if (!store.team || store.team.slug != team.slug) {
      context.setContextStore({team});
      const path = `/${team.slug}`;
      store.history.push(path);
    }
  }

  componentDidMount() {
    this.setContextTeam();
    this.firstTimeFocusProjectInput();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  cancelEditTeam(e) {
    e.preventDefault();
    this.setState({isEditing: false});
  }

  firstTimeFocusProjectInput() {
    const projectList = document.querySelector('.team__projects-list');
    const projectInput = document.querySelector('#create-project-title');

    if (projectInput && projectList.innerHTML === '') {
      projectInput.focus();
    }
  }

  editTeamInfo() {
    const that = this;

    const onFailure = transaction => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.editError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({message, submitDisabled: false});
    };

    const onSuccess = response => {
      this.setState({
        message: that.props.intl.formatMessage(messages.editSuccess),
        isEditing: false,
        submitDisabled: false,
      });
    };

    const values = that.state.values;

    if (!that.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          name: values.name,
          description: values.description,
          set_slack_notifications_enabled: values.slackNotificationsEnabled,
          set_slack_webhook: values.slackWebhook,
          set_slack_channel: values.slackChannel,
          contact: JSON.stringify({
            location: values.contact_location,
            phone: values.contact_phone,
            web: values.contact_web,
          }),
          id: that.props.team.id,
        }),
        {onSuccess, onFailure}
      );
      that.setState({submitDisabled: true});
    }
  }

  handleEditTeam() {
    this.editTeamInfo();
  }

  handleEntreEditTeamNameAndDescription(e) {
    this.setState({isEditing: true});
    e.preventDefault();
  }

  handleChange(key, e) {
    let value = e.target.value;
    if (e.target.type === 'checkbox' && !e.target.checked) {
      value = '0';
    }
    const values = Object.assign({}, this.state.values);
    values[key] = value;
    this.setState({values});
  }

  render() {
    const team = this.props.team;
    const isEditing = this.state.isEditing;
    const contact = team.contacts.edges[0];
    const contactInfo = [];

    if (contact) {
      if (!!contact.node.location) {
        contactInfo.push(<span className="team__location"><span className="team__location-name">{contact.node.location}</span></span>);
      }

      if (!!contact.node.phone) {
        contactInfo.push(<span className="team__phone"><span className="team__phone-name">{contact.node.phone}</span></span>);
      }

      if (!!contact.node.web) {
        contactInfo.push(<span className="team__web"><a href={contact.node.web} className="team__link-name" target="_blank" rel="noopener noreferrer">{contact.node.web}</a></span>);
      }
    }

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <Card className="team__profile team__profile--editing">
            <ContentColumn>
              <Message message={this.state.message} />
              {(() => {
                if (isEditing) {
                  return (
                    <div>
                      <CardText>
                        <div className="team__primary-info">
                          <TextField
                            className="team__name-input"
                            id="team__name-container"
                            defaultValue={team.name}
                            floatingLabelText={this.props.intl.formatMessage(messages.teamName)}
                            onChange={this.handleChange.bind(this, 'name')}
                            fullWidth
                          />

                          <TextField
                            className="team__description"
                            id="team__description-container"
                            defaultValue={team.description}
                            floatingLabelText={this.props.intl.formatMessage(messages.teamDescription)}
                            onChange={this.handleChange.bind(this, 'description')}
                            fullWidth
                            multiLine={true}
                            rows={1}
                            rowsMax={4}
                          />

                          <TextField
                            className="team__location"
                            id="team__location-container"
                            defaultValue={contact ? contact.node.location : ''}
                            floatingLabelText={this.props.intl.formatMessage(messages.location)}
                            onChange={this.handleChange.bind(this, 'contact_location')}
                            fullWidth
                          />

                          <TextField
                            className="team__phone"
                            id="team__phone-container"
                            defaultValue={contact ? contact.node.phone : ''}
                            floatingLabelText={this.props.intl.formatMessage(messages.phone)}
                            onChange={this.handleChange.bind(this, 'contact_phone')}
                            fullWidth
                          />

                          <TextField
                            className="team__location-name-input"
                            id="team__link-container"
                            defaultValue={contact ? contact.node.web : ''}
                            floatingLabelText={this.props.intl.formatMessage(messages.website)}
                            onChange={this.handleChange.bind(this, 'contact_web')}
                            fullWidth
                          />
                        </div>

                        <div className="team__settings">
                          <Checkbox
                            label={<FormattedMessage id="teamComponent.slackNotificationsEnabled"defaultMessage="Enable Slack notifications" />}
                            defaultChecked={team.get_slack_notifications_enabled === '1'}
                            onCheck={this.handleChange.bind(this, 'slackNotificationsEnabled')}
                            id="team__settings-slack-notifications-enabled"
                            value="1"
                          />

                          <TextField
                            id="team__settings-slack-webhook"
                            defaultValue={team.get_slack_webhook}
                            floatingLabelText={this.props.intl.formatMessage(messages.slackWebhook)}
                            onChange={this.handleChange.bind(this, 'slackWebhook')}
                            fullWidth
                          />

                          <TextField
                            id="team__settings-slack-channel"
                            defaultValue={team.get_slack_channel}
                            floatingLabelText={this.props.intl.formatMessage(messages.slackChannel)}
                            onChange={this.handleChange.bind(this, 'slackChannel')}
                            fullWidth
                          />
                        </div>
                      </CardText>

                      <CardActions className="team__profile-card-actions">
                        <FlatButton
                          className="team__cancel-button"
                          label={<FormattedMessage id="teamComponent.cancelButton"defaultMessage="Cancel" />}
                          onClick={this.cancelEditTeam.bind(this)}
                        />

                        <FlatButton
                          className="team__save-button"
                          label={<FormattedMessage id="teamComponent.saveButton"defaultMessage="Save"disabled={this.state.submitDisabled} />}
                          primary
                          onClick={this.handleEditTeam.bind(this)}
                        />
                      </CardActions>
                    </div>
                  );
                }

                return (
                  <div>
                    <section className="layout-two-column">
                      <div className="column-secondary">
                        <div
                          className="team__avatar"
                          style={{ 'backgroundImage': `url(${team.avatar})` }}
                          title={this.props.intl.formatMessage(messages.changeAvatar)}
                        />
                      </div>
                      <div className="column-primary">
                        <div className="team__primary-info">
                          <h1 className="team__name">
                            {team.name}
                          </h1>
                          <div className="team__description">
                            <p className="team__description-text">
                              {team.description ||
                                <MappedMessage msgObj={messages} msgKey="verificationTeam" />}
                            </p>
                          </div>
                        </div>

                        <div className="team__contact-info">
                          {contactInfo}
                        </div>
                      </div>
                    </section>
                    <section className="layout-fab-container">
                      <Can permissions={team.permissions} permission="update Team">
                        <IconButton
                          className="team__edit-button"
                          tooltip={<FormattedMessage id="teamComponent.editButton" defaultMessage="Edit profile" />}
                          tooltipPosition="top-center"
                          onTouchTap={this.handleEntreEditTeamNameAndDescription.bind(this)}
                        >
                          <MDEdit />
                        </IconButton>
                      </Can>
                    </section>
                  </div>
                );
              })()}
            </ContentColumn>
          </Card>

          <ContentColumn>
            <Card>
              <CardHeader title={<MappedMessage msgObj={messages} msgKey="verificationProjects" />} />
              <ul className="team__projects-list">
                {team.projects.edges
                  .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                  .map(p => (
                    <li key={p.node.dbid} className="team__project">
                      <Link to={`/${team.slug}/project/${p.node.dbid}`} className="team__project-link">
                        {p.node.title} <MDChevronRight className="arrow" />
                      </Link>
                    </li>
                  ))}
              </ul>
              <Can permissions={team.permissions} permission="create Project">
                <CreateProject className="team__new-project-input" team={team} />
              </Can>
            </Card>
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

TeamComponent.propTypes = {
  intl: intlShape.isRequired,
};

TeamComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamComponent);
