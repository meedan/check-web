import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import PageTitle from '../PageTitle';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import CreateTeamMutation from '../../relay/CreateTeamMutation';
import base64 from 'base-64';
import Message from '../Message';
import { Link } from 'react-router';
import config from 'config';
import ContentColumn from '../layout/ContentColumn';
import CheckContext from '../../CheckContext';
import Heading from '../layout/Heading';
import XRegExp from 'xregexp';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';

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
      slugName: ''
    };
  }

  getContext() {
    const context = new CheckContext(this);
    return context.getContextStore();
  }

  displayNameLabelClass(suffix) {
    const defaultClass = 'create-team__team-display-name-label';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  slugClass(suffix) {
    const defaultClass = 'create-team__team-slug';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  slugLabelClass(suffix) {
    const defaultClass = 'create-team__team-slug-label';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  handleDisplayNameChange(e) {
    const isTextEntered = e.target.value && e.target.value.length > 0;
    const newClass = isTextEntered ? this.displayNameLabelClass('--text-entered') : this.displayNameLabelClass();
    this.setState({ displayNameLabelClass: newClass, displayName: e.target.value });
  }

  handleDisplayNameBlur(e) {
    const slugSuggestion = slugify(e.target.value);
    if (!this.state.slugName && slugSuggestion.length) {
      this.setState({ slugName: slugSuggestion });
    }

    function slugify(text) {
      const regex = XRegExp('[^\\p{L}\\p{N}]+', 'g');
      return XRegExp.replace(text.toString().toLowerCase().trim(), regex, '-');
    }
  }

  handleSlugChange(e) {
    const slug = e.target.value;
    const isTextEntered = slug && slug.length > 0;

    this.setState({
      slugName: slug
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
      } catch (e) { }
      this.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null });
      const team = response.createTeam.team;
      const path = `/${team.slug}`;
      this.getContext().history.push(path);
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

  componentDidMount() {
    this.teamNameInput.focus();
  }

  render() {
    return (
      <PageTitle prefix={this.props.intl.formatMessage(messages.title)} skipTeam={true}>
        <main className="create-team">
          <ContentColumn narrow>
          <Message message={this.state.message} />
            <Card>
              <CardHeader
                titleStyle={{fontSize: "20px", lineHeight: "32px"}}
                title={<FormattedMessage id="createTeam.mainHeading" defaultMessage="Create a Team" />}
                subtitle={<FormattedMessage id="createTeam.blurb" defaultMessage="Create a team for your organization, or just for yourself:" />}
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
                      ref={input => this.teamNameInput = input}
                      floatingLabelText={<FormattedMessage id="createTeam.displayName" defaultMessage="Team Name" />}
                      fullWidth
                    />
                  </div>

                  <div className="create-team__team-url">
                    <span className="create-team__root-domain">{config.selfHost}/</span>
                    <TextField
                      value={this.state.slugName}
                      type="text"
                      name="teamSlug"
                      id="team-slug-container"
                      className="create-team__team-slug-input"
                      onChange={this.handleSlugChange.bind(this)}
                      defaultValue={this.props.intl.formatMessage(messages.teamSlugHint)}
                      autoComplete="off"
                      fullWidth
                    />
                  </div>
                </CardText>
                <CardActions>
                  <RaisedButton
                    type="submit"
                    className="create-team__submit-button"
                    label={<FormattedMessage id="createTeam.submitButton" defaultMessage="Create" />}
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
