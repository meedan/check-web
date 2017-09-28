import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import rtlDetect from 'rtl-detect';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { List, ListItem } from 'material-ui/List';
import styled from 'styled-components';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import MappedMessage from '../MappedMessage';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';
import CreateProject from '../project/CreateProject';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';
import ParsedText from '../ParsedText';
import {
  ContentColumn,
  highlightBlue,
  checkBlue,
  titleStyle,
  listItemStyle,
  listStyle,
  units,
  black54,
  caption,
  title,
  subheading1,
  avatarStyle,
} from '../../styles/js/shared';

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
    const team = this.props.team;
    const contact = team.contacts.edges[0] || { node: {} };
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

  componentDidMount() {
    this.setContextTeam();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  setContextTeam() {
    const context = new CheckContext(this);
    const store = context.getContextStore();
    const team = this.props.team;

    if (!store.team || store.team.slug !== team.slug) {
      context.setContextStore({ team });
      const path = `/${team.slug}`;
      store.history.push(path);
    }
  }

  cancelEditTeam(e) {
    e.preventDefault();
    this.setState({ isEditing: false });
  }

  editTeamInfo() {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.editError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {
        return '';
      }
      return that.setState({ message, submitDisabled: false });
    };

    const onSuccess = () => {
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
        { onSuccess, onFailure },
      );
      that.setState({ submitDisabled: true });
    }
  }

  handleEditTeam() {
    this.editTeamInfo();
  }

  handleEnterEditMode(e) {
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
    const contactInfo = [];

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const TeamName = styled.h1`
      font: ${title};
      margin-bottom: ${units(0.5)};
    `;

    const TeamDescription = styled.div`
      color: ${black54};
      font: ${subheading1};
      margin-bottom: ${units(1)};
    `;

    const TeamContactInfo = styled.div`
      color: ${black54};
      display: flex;
      flex-flow: wrap row;
      font: ${caption};

      & > span {
        margin-${direction.to}: ${units(2)};
      }
    `;

    const TeamAvatar = styled.div`
      ${avatarStyle};
      margin-top: ${units(2.5)};
      margin-${direction.to}: ${units(2)};
    `;

    if (contact) {
      if (contact.node.location) {
        contactInfo.push(
          <span key="contactInfo.location" className="team__location">
            <span className="team__location-name">
              <ParsedText text={contact.node.location} />
            </span>
          </span>,
        );
      }

      if (contact.node.phone) {
        contactInfo.push(
          <span key="contactInfo.phone" className="team__phone">
            <span className="team__phone-name">
              <ParsedText text={contact.node.phone} />
            </span>
          </span>,
        );
      }

      if (contact.node.web) {
        contactInfo.push(
          <span key="contactInfo.web" className="team__web">
            <span className="team__link-name">
              <ParsedText text={contact.node.web} />
            </span>
          </span>,
        );
      }
    }

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <HeaderCard
            canEdit={can(team.permissions, 'update Team')}
            direction={direction}
            handleEnterEditMode={this.handleEnterEditMode.bind(this)}
            isEditing={isEditing}
          >
            <ContentColumn>
              <Message message={this.state.message} />
              {(() => {
                if (isEditing) {
                  return (
                    <div>
                      <CardText>
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
                          floatingLabelText={this.props.intl.formatMessage(
                            messages.teamDescription,
                          )}
                          onChange={this.handleChange.bind(this, 'description')}
                          fullWidth
                          multiLine
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

                        { team.limits.slack_integration === false ? null : <div>
                        <Checkbox
                          style={{ marginTop: units(6) }}
                          label={
                            <FormattedMessage
                              id="teamComponent.slackNotificationsEnabled"
                              defaultMessage="Enable Slack notifications"
                            />
                          }
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
                        /></div> }
                      </CardText>

                      <CardActions style={{ marginTop: units(4) }}>
                        <FlatButton
                          label={
                            <FormattedMessage
                              id="teamComponent.cancelButton"
                              defaultMessage="Cancel"
                            />
                          }
                          onClick={this.cancelEditTeam.bind(this)}
                        />

                        <FlatButton
                          className="team__save-button"
                          label={
                            <FormattedMessage
                              id="teamComponent.saveButton"
                              defaultMessage="Save"
                              disabled={this.state.submitDisabled}
                            />
                          }
                          primary
                          onClick={this.handleEditTeam.bind(this)}
                        />
                      </CardActions>
                    </div>
                  );
                }

                return (
                  <section style={{ display: 'flex' }}>
                    <TeamAvatar
                      style={{ backgroundImage: `url(${team.avatar})` }}
                      title={this.props.intl.formatMessage(messages.changeAvatar)}
                    />
                    <div style={{ flex: 3 }}>
                      <div className="team__primary-info">
                        <TeamName className="team__name">
                          {team.name}
                        </TeamName>
                        <TeamDescription>
                          {<ParsedText text={team.description} /> ||
                            <MappedMessage msgObj={messages} msgKey="verificationTeam" />}
                        </TeamDescription>
                      </div>

                      <TeamContactInfo>
                        {contactInfo}
                      </TeamContactInfo>
                    </div>
                  </section>
                );
              })()}
            </ContentColumn>
          </HeaderCard>
          {(() => {
            if (!isEditing) {
              return (
                <ContentColumn>
                  <Card>
                    <CardHeader
                      titleStyle={titleStyle}
                      title={<MappedMessage msgObj={messages} msgKey="verificationProjects" />}
                    />

                    <List className="projects" style={listStyle}>
                      {team.projects.edges
                        .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                        .map(p =>
                          <Link key={p.node.dbid} to={`/${team.slug}/project/${p.node.dbid}`}>
                            <ListItem
                              innerDivStyle={listItemStyle}
                              className="team__project"
                              hoverColor={highlightBlue}
                              focusRippleColor={checkBlue}
                              touchRippleColor={checkBlue}
                              primaryText={p.node.title}
                              rightIcon={<KeyboardArrowRight />}
                            />
                          </Link>,
                        )}
                    </List>
                    <Can permissions={team.permissions} permission="create Project">
                      <CardActions>
                        <CreateProject team={team} autoFocus={team.projects.edges.length === 0} />
                      </CardActions>
                    </Can>
                  </Card>
                </ContentColumn>
              );
            }
            return '';
          })()}

        </div>
      </PageTitle>
    );
  }
}

TeamComponent.propTypes = {
  intl: intlShape.isRequired,
  team: PropTypes.object,
};

TeamComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamComponent);
