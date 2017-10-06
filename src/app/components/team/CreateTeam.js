import React, { Component } from 'react';
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
import config from 'config';
import PageTitle from '../PageTitle';
import CreateTeamMutation from '../../relay/CreateTeamMutation';
import Message from '../Message';
import CheckContext from '../../CheckContext';
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
      displayNameLabelClass: this.displayNameLabelClass(),
      slugClass: this.slugClass(),
      slugLabelClass: this.slugLabelClass(),
      slugMessage: '',
      buttonIsDisabled: true,
      displayName: '',
      slugName: '',
    };
  }

  componentDidMount() {
    this.teamNameInput.focus();
  }

  getContext() {
    const context = new CheckContext(this);
    return context.getContextStore();
  }

  displayNameLabelClass(suffix) {
    const defaultClass = 'create-team__team-display-name-label';
    return suffix
      ? [defaultClass, defaultClass + suffix].join(' ')
      : defaultClass;
  }

  slugClass(suffix) {
    const defaultClass = 'create-team__team-slug';
    return suffix
      ? [defaultClass, defaultClass + suffix].join(' ')
      : defaultClass;
  }

  slugLabelClass(suffix) {
    const defaultClass = 'create-team__team-slug-label';
    return suffix
      ? [defaultClass, defaultClass + suffix].join(' ')
      : defaultClass;
  }

  handleDisplayNameChange(e) {
    const isTextEntered = e.target.value && e.target.value.length > 0;
    const newClass = isTextEntered
      ? this.displayNameLabelClass('--text-entered')
      : this.displayNameLabelClass();
    this.setState({
      displayNameLabelClass: newClass,
      displayName: e.target.value,
    });
  }

  handleDisplayNameBlur(e) {
    function slugify(text) {
      const regex = XRegExp('[^\\p{L}\\p{N}]+', 'g');
      return XRegExp.replace(text.toString().toLowerCase().trim(), regex, '-');
    }

    const slugSuggestion = slugify(e.target.value);

    if (!this.state.slugName && slugSuggestion.length) {
      this.setState({ slugName: slugSuggestion });
    }
  }

  handleSlugChange(e) {
    const slug = e.target.value;

    this.setState({
      slugName: slug,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.createTeamError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      this.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null });
      const team = response.createTeam.team;

      const context = this.getContext();
      const teams = JSON.parse(context.currentUser.teams);
      teams[team.slug] = { status: 'member' };
      context.currentUser.teams = JSON.stringify(teams);

      const path = `/${team.slug}`;
      context.history.push(path);
    };

    Relay.Store.commitUpdate(
      new CreateTeamMutation({
        name: this.state.displayName,
        slug: this.state.slugName,
        description: '',
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
                      value={this.state.displayName}
                      type="text"
                      name="teamDisplayName"
                      id="team-name-container"
                      className="create-team__team-display-name-input"
                      onChange={this.handleDisplayNameChange.bind(this)}
                      onBlur={this.handleDisplayNameBlur.bind(this)}
                      autoComplete="off"
                      ref={input => (this.teamNameInput = input)}
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
                      name="teamSlug"
                      id="team-slug-container"
                      className="create-team__team-slug-input"
                      onChange={this.handleSlugChange.bind(this)}
                      hintText={this.props.intl.formatMessage(
                        messages.teamSlugHint,
                      )}
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
  intl: intlShape.isRequired,
};

CreateTeam.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(CreateTeam);
