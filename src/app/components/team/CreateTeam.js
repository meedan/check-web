import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import CreateTeamMutation from '../../relay/CreateTeamMutation';
import base64 from 'base-64';
import Message from '../Message';
import { Link } from 'react-router';
import config from 'config';
import { pageTitle } from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import CheckContext from '../../CheckContext';
import Heading from '../layout/Heading';

const messages = defineMessages({
  slugChecking: {
      id: 'createTeam.slugChecking',
      defaultMessage: 'Checking availability...'
  },
  slugAvailable: {
      id: 'createTeam.slugAvailable',
      defaultMessage: 'Available!'
  },
  slugUnavailable: {
      id: 'createTeam.slugUnavailable',
      defaultMessage: 'That URL is unavailable.'
  },
  createTeamError: {
    id: 'createTeam.createTeamError',
    defaultMessage: 'Sorry, could not create the team'
  },
  title: {
    id: 'createTeam.title',
    defaultMessage: 'Create a Team'
  },
  teamNameHint: {
    id: 'createTeam.teamNameHint',
    defaultMessage: 'Team Name'
  },
  teamSlugHint: {
    id: 'createTeam.teamSlugHint',
    defaultMessage: 'team-slug'
  }
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
    this.setState({ displayNameLabelClass: newClass });
  }

  handleDisplayNameBlur(e) {
    const displayName = e.target.value;
    const slugInput = document.getElementsByClassName('create-team__team-slug-input')[0];

    const slugSuggestion = slugify(displayName);
    if (!slugInput.value && slugSuggestion.length) {
      slugInput.value = slugSuggestion;
    }

    function slugify(text) {
      return text.toString().toLowerCase().trim().replace(/&/g, '-and-').replace(/[\s\W-]+/g, '-');
    }
  }

  handleSlugChange(e) {
    const slug = e.target.value;
    const isTextEntered = slug && slug.length > 0;

    this.setState({
      slugLabelClass: (isTextEntered ? this.slugLabelClass('--text-entered') : this.slugLabelClass()),
    });

    // stubs pending real/API implementation; may need debouncing?
    const slugIsPending = false;
    const slugIsAvailable = false;
    const slugIsUnavailable = false;

    if (slugIsPending) {
      this.setState({
        slugClass: this.slugClass(),
        slugMessage: this.props.intl.formatMessage(messages.slugChecking),
        buttonIsDisabled: true,
      });
    } else if (slugIsAvailable) {
      this.setState({
        slugClass: this.slugClass('--success'),
        slugMessage: this.props.intl.formatMessage(messages.slugAvailable),
        buttonIsDisabled: false,
      });
    } else if (slugIsUnavailable) {
      this.setState({
        slugClass: this.slugClass('--error'),
        slugMessage: this.props.intl.formatMessage(messages.slugUnavailable),
        buttonIsDisabled: true,
      });
    } else {
      this.setState({
        slugClass: this.slugClass(),
        slugMessage: '',
        buttonIsDisabled: true,
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let that = this,
      name = document.getElementById('team-name-container').value,
      slug = document.getElementById('team-slug-container').value;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.createTeamError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null });
      const team = response.createTeam.team;
      const path = `/${team.slug}`;
      that.getContext().history.push(path);
    };

    Relay.Store.commitUpdate(
       new CreateTeamMutation({
         name,
         description: '',
         slug,
       }),
      { onSuccess, onFailure },
    );
  }

  componentDidMount() {
    this.teamNameInput.focus();
  }

  render() {
    return (
      <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), true)}>
        <main className="create-team">
          <Message message={this.state.message} />
          <ContentColumn>
            <Heading><FormattedMessage id="createTeam.mainHeading" defaultMessage="Create a Team" /></Heading>
            <p className="create-team__blurb"><FormattedMessage id="createTeam.blurb" defaultMessage="Create a team for your organization, or just for yourself:" /></p>
            <form className="create-team__form">
              <div className="create-team__team-display-name">
                <input
                  type="text"
                  name="teamDisplayName"
                  id="team-name-container"
                  className="create-team__team-display-name-input"
                  onChange={this.handleDisplayNameChange.bind(this)}
                  onBlur={this.handleDisplayNameBlur.bind(this)}
                  placeholder={this.props.intl.formatMessage(messages.teamNameHint)}
                  autoComplete="off"
                  ref={input => this.teamNameInput = input}
                />
                <label className={this.state.displayNameLabelClass}><FormattedMessage id="createTeam.displayName" defaultMessage="Team Name" /></label>
              </div>
              <div className="create-team__team-url">
                <span className="create-team__root-domain">checkmedia.org/</span>
                <div className={this.state.slugClass}>
                  <input
                    type="text"
                    name="teamSlug"
                    id="team-slug-container"
                    className="create-team__team-slug-input"
                    onChange={this.handleSlugChange.bind(this)}
                    placeholder={this.props.intl.formatMessage(messages.teamSlugHint)}
                    autoComplete="off"
                  />
                  <label className={this.state.slugLabelClass}><FormattedMessage id="createTeam.url" defaultMessage="Team URL" /></label>
                  <p className="create-team__team-slug-message">{this.state.slugMessage}</p>
                </div>
              </div>
              <button type="submit" onClick={this.handleSubmit.bind(this)} className="create-team__submit-button">
                <FormattedMessage id="createTeam.submitButton" defaultMessage="Create" />
              </button>
            </form>
          </ContentColumn>
        </main>
      </DocumentTitle>
    );
  }
}

CreateTeam.propTypes = {
  intl: intlShape.isRequired
};

CreateTeam.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(CreateTeam);
