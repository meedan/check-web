import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory, Link } from 'react-router';
import XRegExp from 'xregexp';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
} from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Message from '../Message';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import {
  black38,
  caption,
  checkBlue,
  subheading2,
} from '../../styles/js/shared';
import CreateTeamMutation from '../../relay/mutations/CreateTeamMutation';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  slugChecking: {
    id: 'createTeam.slugChecking',
    defaultMessage: 'Checking availability…',
  },
  slugAvailable: {
    id: 'createTeam.slugAvailable',
    defaultMessage: 'Available!',
  },
  slugUnavailable: {
    id: 'createTeam.slugUnavailable',
    defaultMessage: 'Sorry, this slug is unavailable. Please try another one.',
  },
  createTeamError: {
    id: 'createTeam.createTeamError',
    defaultMessage: 'Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists.',
  },
  title: {
    id: 'createTeam.title',
    defaultMessage: 'Create a workspace',
  },
  teamNameHint: {
    id: 'createTeam.teamNameHint',
    defaultMessage: 'Workspace Name',
  },
  teamSlugHint: {
    id: 'createTeam.teamSlugHint',
    defaultMessage: 'Workspace URL',
  },
});

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

class CreateTeamCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      teamName: '',
      slugName: '',
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleNameChange = (e) => {
    this.setState({ teamName: e.target.value });
  };

  handleSlugChange = (e) => {
    this.setState({ slugName: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const context = this.getContext();

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.createTeamError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
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
      browserHistory.push(path);
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
  };

  handleDisplayNameBlur = (e) => {
    function slugify(text) {
      const regex = XRegExp('[^\\p{L}\\p{N}]+', 'g');
      return XRegExp.replace(text.toString().toLowerCase().trim(), regex, '-');
    }

    const slugName = slugify(e.target.value);

    if (!this.state.slugName && slugName.length) {
      this.setState({ slugName });
    }
  };

  render() {
    return (
      <div>
        <Message message={this.state.message} />
        <Card className="create-team-card">
          <CardHeader
            title={
              <FormattedMessage
                id="createTeam.mainHeading"
                defaultMessage="Create a workspace"
              />
            }
            subheader={
              <FormattedMessage
                id="createTeam.blurb"
                defaultMessage="Create a workspace for your organization, or just for yourself:"
              />
            }
          />
          <form className="create-team__form">
            <CardContent>
              <div className="create-team__team-display-name">
                <TextField
                  type="text"
                  id="team-name-container"
                  className="create-team__team-display-name-input"
                  onChange={this.handleNameChange}
                  onBlur={this.handleDisplayNameBlur}
                  autoComplete="off"
                  autoFocus
                  label={
                    <FormattedMessage
                      id="createTeam.displayName"
                      defaultMessage="Workspace Name"
                    />
                  }
                  fullWidth
                  margin="normal"
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
                  onChange={this.handleSlugChange}
                  placeholder={this.props.intl.formatMessage(messages.teamSlugHint)}
                  autoComplete="off"
                  margin="normal"
                  fullWidth
                />
              </TeamUrlRow>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className="create-team__submit-button"
                onClick={this.handleSubmit}
              >
                <FormattedMessage
                  id="createTeam.submitButton"
                  defaultMessage="Create"
                />
              </Button>
            </CardActions>
          </form>
        </Card>
        <Box mt={2}>
          <Link to="/check/teams/find" className="create-team__toggle-find">
            <FormattedMessage
              id="createTeam.requestToJoin"
              defaultMessage="You can also request to join an existing workspace."
            />
          </Link>
        </Box>
      </div>
    );
  }
}

CreateTeamCard.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateTeamCard);
