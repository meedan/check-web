import React, {Component, PropTypes} from 'react';
import Relay from 'react-relay';
import PageTitle from '../PageTitle';
import MappedMessage from '../MappedMessage';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Tags from './Tags';
import {Link} from 'react-router';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

import MdCreate from 'react-icons/lib/md/create';

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
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  cancelEditTeam(e) {
    e.preventDefault();
    this.setState({isEditing: false});
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

    if (contact.node.location) {
      contactInfo.push(<span className="team__location"><span className="team__location-name">{contact.node.location}</span></span>);
    }

    if (contact.node.phone) {
      contactInfo.push(<span className="team__phone"><span className="team__phone-name">{contact.node.phone}</span></span>);
    }

    if (contact.node.web) {
      contactInfo.push(<span className="team__web"><span className="team__link-name">{contact.node.web}</span></span>);
    }

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <ContentColumn className="card">
            <Message message={this.state.message} />
            {(() => {
              if (isEditing) {
                return (
                  <section className="team__profile team__profile--editing">
                    <button onClick={this.cancelEditTeam.bind(this)} className="team__cancel-button">
                      <FormattedMessage id="teamComponent.cancelButton" defaultMessage="Cancel" />
                    </button>
                    <button onClick={this.handleEditTeam.bind(this)} className="team__save-button" disabled={this.state.submitDisabled}>
                      <FormattedMessage id="teamComponent.saveButton" defaultMessage="Save" />
                    </button>

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
                  </section>
                );
              }

              return (
                <section className="team__profile">
                  <Can permissions={team.permissions} permission="update Team">
                    <div className="team__edit-profile">
                      <button onClick={this.handleEntreEditTeamNameAndDescription.bind(this)} className="team__edit-button">
                        <FormattedMessage
                          id="teamComponent.editButton"
                          defaultMessage="Edit profile"
                        />
                      </button>
                    </div>
                  </Can>

                  <div
                    className="team__avatar"
                    style={{ 'background-image': `url(${team.avatar})` }}
                    title={this.props.intl.formatMessage(messages.changeAvatar)}
                  />

                  <div className="team__primary-info">
                    <h1 className="team__name">
                      <Link to="#" className="team__name-link">{team.name}</Link>
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
                </section>
              );
            })()}
          </ContentColumn>

          <ContentColumn className="card">
            <div className="team__content">
              <div className="team__content-body">
                <h3 className="team__projects-heading">
                  <MappedMessage
                    msgObj={messages}
                    msgKey="verificationProjects"
                  />
                </h3>
                <ul className="team__projects-list">
                  {team.projects.edges
                    .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                    .map(p => (
                      <li className="team__project">
                        <Link
                          to={`/${team.slug}/project/${p.node.dbid}`}
                          className="team__project-link">
                          {p.node.title}
                        </Link>
                      </li>
                    ))}
                  <Can permissions={team.permissions} permission="create Project">
                    <li className="team__new-project">
                      <CreateProject className="team__new-project-input" team={team} />
                    </li>
                  </Can>
                </ul>
              </div>
            </div>
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
