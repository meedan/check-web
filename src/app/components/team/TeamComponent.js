import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Tags from './Tags';
import { Link } from 'react-router';
import { MdLink, MdCreate, MdLocationOn, MdLocalPhone } from 'react-icons/lib/md';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';
import CreateContactMutation from '../../relay/CreateContactMutation';
import UpdateContactMutation from '../../relay/UpdateContactMutation';
import CreateProject from '../project/CreateProject';
import Can from '../Can';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';

const messages = defineMessages({
  editError: {
    id: 'teamComponent.editError',
    defaultMessage: 'Sorry, could not edit the team'
  },
  editSuccess: {
    id: 'teamComponent.editSuccess',
    defaultMessage: 'Team information updated successfully!'
  },
  changeAvatar: {
    id: 'teamComponent.changeAvatar',
    defaultMessage: "You can't change this right now, but we're hard at work to enable it soon!"
  },
  teamName: {
    id: 'teamComponent.teamName',
    defaultMessage: 'Team name'
  },
  teamDescription: {
    id: 'teamComponent.teamDescription',
    defaultMessage: 'Team description'
  },
  location: {
    id: 'teamComponent.location',
    defaultMessage: 'Location'
  },
  phone: {
    id: 'teamComponent.phone',
    defaultMessage: 'Phone number'
  },
  website: {
    id: 'teamComponent.website',
    defaultMessage: 'Website'
  },
  slackWebhook: {
    id: 'teamComponent.slackWebhook',
    defaultMessage: 'Slack webhook'
  },
  slackChannel: {
    id: 'teamComponent.slackChannel',
    defaultMessage: 'Slack default #channel'
  }
});

class TeamComponent extends Component {
  constructor(props) {
    super(props);
    const team = this.props.team,
      contact = team.contacts.edges[0] || { node: {} };
    this.state = {
      message: null,
      isEditing: false,
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
      context.setContextStore({ team: team });
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
    this.setState({ isEditing: false });
  }

  editTeamInfo() {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: this.props.intl.formatMessage(messages.editSuccess), isEditing: false });
    };

    const values = that.state.values;
    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        name: values.name,
        description: values.description,
        set_slack_notifications_enabled: values.slackNotificationsEnabled,
        set_slack_webhook: values.slackWebhook,
        set_slack_channel: values.slackChannel,
        contact: JSON.stringify({ location: values.contact_location, phone: values.contact_phone, web: values.contact_web }),
        id: that.props.team.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleEditTeam() {
    this.editTeamInfo();
  }

  handleEntreEditTeamNameAndDescription(e) {
    this.setState({ isEditing: true });
    e.preventDefault();
  }

  handleChange(key, e) {
    let value = e.target.value;
    if (e.target.type === 'checkbox' && !e.target.checked) {
      value = '0';
    }
    const values = Object.assign({}, this.state.values);
    values[key] = value;
    this.setState({ values });
  }

  render() {
    const team = this.props.team;
    const isEditing = this.state.isEditing;
    const contact = team.contacts.edges[0];

    return (
      <DocumentTitle title={pageTitle(false, false, team)}>
        <div className="team">
          <ContentColumn>
            <Message message={this.state.message} />
            <section className="team__profile">

              {(() => {
                if (isEditing) {
                  return (
                    <div className="team__edit-profile team__edit-profile--editing">
                      <button onClick={this.cancelEditTeam.bind(this)} className="team__cancel-button">
                        <FormattedMessage id="teamComponent.cancelButton" defaultMessage="Cancel" />
                      </button>
                      <button onClick={this.handleEditTeam.bind(this)} className="team__save-button">
                        <FormattedMessage id="teamComponent.saveButton" defaultMessage="Save" />
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <Can permissions={team.permissions} permission="update Team">
                      <div className="team__edit-profile">
                        <button onClick={this.handleEntreEditTeamNameAndDescription.bind(this)} className="team__edit-button">
                          <MdCreate className="team__edit-icon" />&nbsp;
                          <FormattedMessage id="teamComponent.editButton" defaultMessage="Edit profile" />
                        </button>
                      </div>
                    </Can>
                  );
                }
              })()}

              <div className="team__avatar" style={{ 'background-image': `url(${team.avatar})` }} title={this.props.intl.formatMessage(messages.changeAvatar)} />

              {(() => {
                if (this.state.isEditing) {
                  return (
                    <div>
                      <h1 className="team__name team__name--editing">
                        <input type="text" id="team__name-container" className="team__name-input" defaultValue={team.name} onChange={this.handleChange.bind(this, 'name')} placeholder={this.props.intl.formatMessage(messages.teamName)} />
                      </h1>
                      <div className="team__description">
                        <input type="text" id="team__description-container" className="team__description-input" defaultValue={team.description} placeholder={this.props.intl.formatMessage(messages.teamDescription)} onChange={this.handleChange.bind(this, 'description')} />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <h1 className="team__name">
                        <Link to="#" className="team__name-link">{team.name}</Link>
                      </h1>
                      <div className="team__description">
                        <p className="team__description-text">{team.description}</p>
                      </div>
                    </div>
                  );
                }
              })()}

              <div className="team__contact-info">
                <span className="team__location">
                  {(() => {
                    if (isEditing) {
                      return (<span><MdLocationOn className="team__location-icon" />
                        <input
                          type="text" id="team__location-container" defaultValue={contact ? contact.node.location : ''}
                          className="team__location-name-input" placeholder={this.props.intl.formatMessage(messages.location)}
                          onChange={this.handleChange.bind(this, 'contact_location')}
                        /></span>);
                    } else if (contact && !!contact.node.location) {
                      return (<span><MdLocationOn className="team__location-icon" />
                        <span className="team__location-name">{contact.node.location}</span></span>);
                    } else {
                      return (<span className="team__location-name" />);
                    }
                  })()}
                </span>
                <span className="team__phone">
                  {(() => {
                    if (isEditing) {
                      return (<span><MdLocalPhone className="team__phone-icon" />
                        <input
                          type="text" id="team__phone-container" defaultValue={contact ? contact.node.phone : ''}
                          className="team__location-name-input" placeholder={this.props.intl.formatMessage(messages.phone)}
                          onChange={this.handleChange.bind(this, 'contact_phone')}
                        /></span>);
                    } else if (contact && !!contact.node.phone) {
                      return (<span><MdLocalPhone className="team__phone-icon" />
                        <span className="team__phone-name">{contact.node.phone}</span></span>);
                    } else {
                      return (<span className="team__phone-name" />);
                    }
                  })()}
                </span>
                <span className="team__web">
                  {(() => {
                    if (isEditing) {
                      return (<span><MdLink className="team__link-icon" />
                        <input
                          type="text" id="team__link-container" defaultValue={contact ? contact.node.web : ''}
                          className="team__location-name-input" placeholder={this.props.intl.formatMessage(messages.website)}
                          onChange={this.handleChange.bind(this, 'contact_web')}
                        /></span>);
                    } else if (contact && !!contact.node.web) {
                      return (<span><MdLink className="team__link-icon" />
                        <span className="team__link-name">{contact.node.web}</span></span>);
                    } else {
                      return (<span className="team__link-name" />);
                    }
                  })()}
                </span>
              </div>
            </section>

            {(() => {
              if (isEditing) {
                return (
                  <section className="team__settings">
                    <span>
                      <input type="checkbox" id="team__settings-slack-notifications-enabled" value="1" defaultChecked={team.get_slack_notifications_enabled === '1'} onChange={this.handleChange.bind(this, 'slackNotificationsEnabled')} />
                      <label htmlFor="team__settings-slack-notifications-enabled"><FormattedMessage id="teamComponent.slackNotificationsEnabled" defaultMessage="Enable Slack notifications" /></label>
                    </span>
                    <span><input type="text" id="team__settings-slack-webhook" defaultValue={team.get_slack_webhook} placeholder={this.props.intl.formatMessage(messages.slackWebhook)} onChange={this.handleChange.bind(this, 'slackWebhook')} /></span>
                    <span><input type="text" id="team__settings-slack-channel" defaultValue={team.get_slack_channel} placeholder={this.props.intl.formatMessage(messages.slackChannel)} onChange={this.handleChange.bind(this, 'slackChannel')} /></span>
                  </section>
                );
              }
            })()}

            <section className="team__content">
              <div className="team__content-body">
                <h3 className="team__projects-heading"><FormattedMessage id="teamComponent.title" defaultMessage="Verification Projects" /></h3>
                <ul className="team__projects-list">
                  {team.projects.edges.sortp((a, b) => a.node.title.localeCompare(b.node.title)).map(p => (
                    <li className="team__project">
                      <Link to={`/${team.slug}/project/${p.node.dbid}`} className="team__project-link">{p.node.title}</Link>
                    </li>
                  ))}
                  <Can permissions={team.permissions} permission="create Project">
                    <li className="team__new-project">
                      <CreateProject className="team__new-project-input" team={team} autofocus />
                    </li>
                  </Can>
                </ul>
              </div>
            </section>
          </ContentColumn>
        </div>
      </DocumentTitle>
    );
  }
}

TeamComponent.propTypes = {
  intl: intlShape.isRequired
};

TeamComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamComponent);
