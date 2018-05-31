import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay';
import XRegExp from 'xregexp';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import styled from 'styled-components';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import PageTitle from '../PageTitle';
import CreateTeamMutation from '../../relay/mutations/CreateTeamMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
import { safelyParseJSON } from '../../helpers';
import {
  ContentColumn,
  caption,
  subheading2,
  checkBlue,
  black38,
} from '../../styles/js/shared';

const TeamUrlRow = styled.div`
  align-items: flex-end;
  display: flex;
  font-size: 12px;
  margin-top: 24px;
  label {
    font: ${caption};
    color: ${checkBlue};
  }
`;

const TeamUrlColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 9px;
`;

const TeamUrlDomain = styled.span`
  font: ${subheading2};
  color: ${black38};
`;

const messages = defineMessages({
  slugChecking: {
    id: 'createTeam.slugChecking',
    defaultMessage: 'Checking availability...',
  },
  slugAvailable: {
    id: 'createTeam.slugAvailable',
    defaultMessage: 'Available!',
  },
  slugUnavailable: {
    id: 'createTeam.slugUnavailable',
    defaultMessage: 'That URL is unavailable.',
  },
  createTeamError: {
    id: 'createTeam.createTeamError',
    defaultMessage: 'Sorry, could not create the team',
  },
  title: {
    id: 'createTeam.title',
    defaultMessage: 'Create a Team',
  },
  teamNameHint: {
    id: 'createTeam.teamNameHint',
    defaultMessage: 'Team Name',
  },
  teamSlugHint: {
    id: 'createTeam.teamSlugHint',
    defaultMessage: 'team-slug',
  },
});

class CreateTeam extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamName: '',
      slugName: '',
    };
  }

  componentDidMount() {
    this.teamDisplayName.focus();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleDisplayNameBlur(e) {
    function slugify(text) {
      const regex = XRegExp('[^\\p{L}\\p{N}]+', 'g');
      return XRegExp.replace(text.toString().toLowerCase().trim(), regex, '-');
    }

    const slugName = slugify(e.target.value);

    if (!this.state.slugName && slugName.length) {
      this.setState({ teamName: e.target.value, slugName });
    }
  }

  handleSlugChange(e) {
    this.setState({ slugName: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    const context = this.getContext();

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.createTeamError);
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null });
      const { createTeam: { team } } = response;
      const teams = JSON.parse(context.currentUser.teams);
      teams[team.slug] = { status: 'member', role: 'owner' };
      context.currentUser.teams = JSON.stringify(teams);
      context.currentUser.current_team = team;
      context.team = team;

      const path = `/${team.slug}`;
      context.history.push(path);
    };

    Relay.Store.commitUpdate(
      new CreateTeamMutation({
        name: this.state.teamName,
        slug: this.state.slugName,
        description: '',
        user: context.currentUser,
      }),
      { onSuccess, onFailure },
    );
  }


  render() {
    return (
      <PageTitle
        prefix={this.props.intl.formatMessage(messages.title)}
        skipTeam
      >
        <main className="create-team">
          <ContentColumn narrow>
            <Message message={this.state.message} />
            <Card>
              <CardHeader
                titleStyle={{ fontSize: '20px', lineHeight: '32px' }}
                title={
                  <FormattedMessage
                    id="createTeam.mainHeading"
                    defaultMessage="Create a Team"
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="createTeam.blurb"
                    defaultMessage="Create a team for your organization, or just for yourself:"
                  />
                }
              />
              <form className="create-team__form">
                <CardText>
                  <div className="create-team__team-display-name">
                    <TextField
                      type="text"
                      id="team-name-container"
                      className="create-team__team-display-name-input"
                      onBlur={this.handleDisplayNameBlur.bind(this)}
                      autoComplete="off"
                      ref={(i) => { this.teamDisplayName = i; }}
                      floatingLabelText={
                        <FormattedMessage
                          id="createTeam.displayName"
                          defaultMessage="Team Name"
                        />
                      }
                      fullWidth
                    />
                  </div>

                  <TeamUrlRow>
                    <TeamUrlColumn>
                      <label htmlFor="team-slug-container">
                        <FormattedMessage
                          id="createTeam.url"
                          defaultMessage="Team URL"
                        />
                      </label>
                      <TeamUrlDomain>
                        {config.selfHost}/
                      </TeamUrlDomain>
                    </TeamUrlColumn>
                    <TextField
                      value={this.state.slugName}
                      type="text"
                      id="team-slug-container"
                      className="create-team__team-slug-input"
                      onChange={this.handleSlugChange.bind(this)}
                      hintText={this.props.intl.formatMessage(messages.teamSlugHint)}
                      autoComplete="off"
                      fullWidth
                    />
                  </TeamUrlRow>
                </CardText>
                <CardActions>
                  <RaisedButton
                    type="submit"
                    className="create-team__submit-button"
                    label={
                      <FormattedMessage
                        id="createTeam.submitButton"
                        defaultMessage="Create"
                      />
                    }
                    primary
                    onClick={this.handleSubmit.bind(this)}
                  />
                </CardActions>
              </form>
            </Card>
          </ContentColumn>
        </main>
      </PageTitle>
    );
  }
}

CreateTeam.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

CreateTeam.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateTeam);
