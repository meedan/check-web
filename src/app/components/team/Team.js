import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import InfiniteScroll from 'react-infinite-scroller';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import rtlDetect from 'rtl-detect';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { List, ListItem } from 'material-ui/List';
import styled from 'styled-components';
import TeamMembersRelay from '../../relay/containers/TeamMembersRelay';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import MappedMessage from '../MappedMessage';
import UpdateTeamMutation from '../../relay/UpdateTeamMutation';
import Message from '../Message';
import CreateProject from '../project/CreateProject';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';
import ParsedText from '../ParsedText';
import UploadImageRelay from '../../relay/UploadImageRelay';
import globalStrings from '../../globalStrings';
import {
  ContentColumn,
  highlightBlue,
  checkBlue,
  title1,
  units,
  avatarStyle,
  Row,
  black54,
} from '../../styles/js/shared';

import {
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
  StyledDescription,
  StyledContactInfo,
  StyledAvatarEditButton,
} from '../../styles/js/HeaderCard';

const messages = defineMessages({
  editError: {
    id: 'team.editError',
    defaultMessage: 'Sorry, could not edit the team',
  },
  editSuccess: {
    id: 'team.editSuccess',
    defaultMessage: 'Team information updated successfully!',
  },
  teamName: {
    id: 'team.teamName',
    defaultMessage: 'Team name',
  },
  teamDescription: {
    id: 'team.teamDescription',
    defaultMessage: 'Team description',
  },
  location: {
    id: 'team.location',
    defaultMessage: 'Location',
  },
  phone: {
    id: 'team.phone',
    defaultMessage: 'Phone number',
  },
  website: {
    id: 'team.website',
    defaultMessage: 'Website',
  },
  slackWebhook: {
    id: 'team.slackWebhook',
    defaultMessage: 'Slack webhook',
  },
  slackChannel: {
    id: 'team.slackChannel',
    defaultMessage: 'Slack default #channel',
  },
  verificationTeam: {
    id: 'team.verificationTeam',
    defaultMessage: 'Verification Team',
  },
  bridge_verificationTeam: {
    id: 'bridge.team.verificationTeam',
    defaultMessage: 'Translation Team',
  },
  verificationProjects: {
    id: 'team.title',
    defaultMessage: 'Verification Projects',
  },
  bridge_verificationProjects: {
    id: 'bridge.team.title',
    defaultMessage: 'Translation Projects',
  },
  noProjects: {
    id: 'team.noProjects',
    defaultMessage: 'No projects yet',
  },
});

const pageSize = 20;

class Team extends Component {
  constructor(props) {
    super(props);
    const team = this.props.team;
    const contact = team.contacts.edges[0] || { node: {} };
    this.state = {
      message: null,
      isEditing: false,
      editProfileImg: false,
      submitDisabled: false,
      showTab: 'members',
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

  onImage(file) {
    document.forms['edit-team-form'].avatar = file;
    this.setState({ message: null, avatar: file });
  }

  onClear() {
    if (document.forms['edit-team-form']) {
      document.forms['edit-team-form'].avatar = null;
    }
    this.setState({ message: null, avatar: null });
  }

  onImageError(file, message) {
    this.setState({ message, avatar: null });
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
    this.setState({ avatar: null, isEditing: false });
  }

  handleEditTeam() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {
        return '';
      }
      return this.setState({ message, avatar: null, submitDisabled: false });
    };

    const onSuccess = () => {
      this.setState({
        message: this.props.intl.formatMessage(messages.editSuccess),
        avatar: null,
        isEditing: false,
        submitDisabled: false,
      });
    };

    const values = this.state.values;
    const form = document.forms['edit-team-form'];

    if (!this.state.submitDisabled) {
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
          id: this.props.team.id,
          public_id: this.props.team.public_team_id,
          avatar: form.avatar,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }
  }

  handleEditProfileImg = () => {
    this.setState({ editProfileImg: true });
  };

  handleEnterEditMode(e) {
    this.setState({ isEditing: true, editProfileImg: false });
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

  handleTabChange = (value) => {
    this.setState({
      showTab: value,
    });
  };

  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.team.projects.edges.length + pageSize });
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

    const TeamAvatar = styled.div`
      ${avatarStyle};
    `;

    const StyledCardHeader = styled(CardHeader)`
      span {
        font: ${title1} !important;
      }
    `;

    if (contact) {
      if (contact.node.location) {
        contactInfo.push(
          <StyledContactInfo key="contactInfo.location" className="team__location">
            <span className="team__location-name">
              <ParsedText text={contact.node.location} />
            </span>
          </StyledContactInfo>,
        );
      }

      if (contact.node.phone) {
        contactInfo.push(
          <StyledContactInfo key="contactInfo.phone" className="team__phone">
            <span className="team__phone-name">
              <ParsedText text={contact.node.phone} />
            </span>
          </StyledContactInfo>,
        );
      }

      if (contact.node.web) {
        contactInfo.push(
          <StyledContactInfo key="contactInfo.web" className="team__web">
            <span className="team__link-name">
              <ParsedText text={contact.node.web} />
            </span>
          </StyledContactInfo>,
        );
      }
    }

    const avatarPreview = this.state.avatar && this.state.avatar.preview;

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
                    <form onSubmit={this.handleEditTeam.bind(this)} name="edit-team-form">
                      <StyledTwoColumns>
                        <StyledSmallColumn>
                          <TeamAvatar
                            style={{ backgroundImage: `url(${avatarPreview || team.avatar})` }}
                          />
                          {!this.state.editProfileImg
                            ? <StyledAvatarEditButton className="team__edit-avatar-button">
                              <FlatButton
                                label={this.props.intl.formatMessage(globalStrings.edit)}
                                onClick={this.handleEditProfileImg.bind(this)}
                                primary
                              />
                            </StyledAvatarEditButton>
                            : null}
                        </StyledSmallColumn>

                        <StyledBigColumn>
                          {this.state.editProfileImg
                            ? <UploadImageRelay
                              onImage={this.onImage.bind(this)}
                              onClear={this.onClear.bind(this)}
                              onError={this.onImageError.bind(this)}
                              noPreview
                            />
                            : null}

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

                            {team.limits.slack_integration === false
                              ? null
                              : <div>
                                <Checkbox
                                  style={{ marginTop: units(6) }}
                                  label={
                                    <FormattedMessage
                                      id="team.slackNotificationsEnabled"
                                      defaultMessage="Enable Slack notifications"
                                    />
                                    }
                                  defaultChecked={team.get_slack_notifications_enabled === '1'}
                                  onCheck={this.handleChange.bind(
                                      this,
                                      'slackNotificationsEnabled',
                                    )}
                                  id="team__settings-slack-notifications-enabled"
                                  value="1"
                                />

                                <TextField
                                  id="team__settings-slack-webhook"
                                  defaultValue={team.get_slack_webhook}
                                  floatingLabelText={this.props.intl.formatMessage(
                                      messages.slackWebhook,
                                    )}
                                  onChange={this.handleChange.bind(this, 'slackWebhook')}
                                  fullWidth
                                />

                                <TextField
                                  id="team__settings-slack-channel"
                                  defaultValue={team.get_slack_channel}
                                  floatingLabelText={this.props.intl.formatMessage(
                                      messages.slackChannel,
                                    )}
                                  onChange={this.handleChange.bind(this, 'slackChannel')}
                                  fullWidth
                                />
                              </div>}
                          </CardText>

                          <CardActions style={{ marginTop: units(4) }}>
                            <FlatButton
                              label={
                                <FormattedMessage
                                  id="team.cancelButton"
                                  defaultMessage="Cancel"
                                />
                              }
                              onClick={this.cancelEditTeam.bind(this)}
                            />

                            <FlatButton
                              className="team__save-button"
                              label={
                                <FormattedMessage
                                  id="team.saveButton"
                                  defaultMessage="Save"
                                  disabled={this.state.submitDisabled}
                                />
                              }
                              primary
                              onClick={this.handleEditTeam.bind(this)}
                            />
                          </CardActions>
                        </StyledBigColumn>
                      </StyledTwoColumns>
                    </form>
                  );
                }

                return (
                  <div>
                    <StyledTwoColumns>
                      <StyledSmallColumn>
                        <TeamAvatar style={{ backgroundImage: `url(${team.avatar})` }} />
                      </StyledSmallColumn>
                      <StyledBigColumn>
                        <div className="team__primary-info">
                          <StyledName className="team__name">
                            {team.name}
                          </StyledName>
                          <StyledDescription>
                            {<ParsedText text={team.description} /> ||
                              <MappedMessage msgObj={messages} msgKey="verificationTeam" />}
                          </StyledDescription>
                        </div>

                        <Row>
                          {contactInfo}
                        </Row>
                      </StyledBigColumn>
                    </StyledTwoColumns>
                    <Tabs value={this.state.showTab} onChange={this.handleTabChange}>
                      <Tab
                        label={
                          <FormattedMessage
                            id="team.members"
                            defaultMessage="Members"
                          />
                        }
                        value="members"
                        className="team__tab-button-members"
                      />
                      <Tab
                        label={
                          <FormattedMessage
                            id="team.projects"
                            defaultMessage="Projects"
                          />
                        }
                        value="projects"
                        className="team__tab-button-projects"
                      />
                    </Tabs>
                  </div>
                );
              })()}
            </ContentColumn>
          </HeaderCard>

          {(() => {
            if (!isEditing) {
              return (
                <ContentColumn>
                  {this.state.showTab === 'members' ? (
                    <TeamMembersRelay {...this.props} />
                  ) : null }
                  {this.state.showTab === 'projects' ? (
                    <div>
                      <Card style={{ marginTop: units(2), marginBottom: units(2) }}>
                        <Can permissions={team.permissions} permission="create Project">
                          <CardActions style={{ padding: `0 ${units(2)} ${units(2)}` }}>
                            <CreateProject
                              team={team}
                              autoFocus={team.projects.edges.length === 0}
                            />
                          </CardActions>
                        </Can>
                      </Card>
                      <Card style={{ marginTop: units(2), marginBottom: units(2) }}>
                        <StyledCardHeader
                          title={<MappedMessage msgObj={messages} msgKey="verificationProjects" />}
                        />

                        {team.projects.edges.length === 0 ?
                          <CardText style={{ color: black54 }}>
                            <MappedMessage msgObj={messages} msgKey="noProjects" />
                          </CardText>
                          :
                          <InfiniteScroll
                            hasMore
                            loadMore={this.loadMore.bind(this)}
                            threshold={500}
                          >
                            <List className="projects" style={{ padding: '0' }}>
                              {team.projects.edges
                              .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                              .map(p =>
                                <Link key={p.node.dbid} to={`/${team.slug}/project/${p.node.dbid}`}>
                                  <ListItem
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
                          </InfiniteScroll>
                        }
                      </Card>
                    </div>
                  ) : null }
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

Team.propTypes = {
  intl: intlShape.isRequired,
  team: PropTypes.object,
};

Team.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Team);
