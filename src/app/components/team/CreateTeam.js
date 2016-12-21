import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import CreateTeamMutation from '../../relay/CreateTeamMutation';
import base64 from 'base-64';
import Message from '../Message';
import { Link } from 'react-router';
import config from 'config';
import { pageTitle } from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import Heading from '../layout/Heading';

class CreateTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNameLabelClass: this.displayNameLabelClass(),
      subdomainClass: this.subdomainClass(),
      subdomainLabelClass: this.subdomainLabelClass(),
      subdomainMessage: '',
      buttonIsDisabled: true,
    };
  }

  displayNameLabelClass(suffix) {
    const defaultClass = 'create-team__team-display-name-label';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  subdomainClass(suffix) {
    const defaultClass = 'create-team__team-subdomain';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  subdomainLabelClass(suffix) {
    const defaultClass = 'create-team__team-subdomain-label';
    return suffix ? [defaultClass, defaultClass + suffix].join(' ') : defaultClass;
  }

  handleDisplayNameChange(e) {
    const isTextEntered = e.target.value && e.target.value.length > 0;
    const newClass = isTextEntered ? this.displayNameLabelClass('--text-entered') : this.displayNameLabelClass();
    this.setState({ displayNameLabelClass: newClass });
  }

  handleDisplayNameBlur(e) {
    const displayName = e.target.value;
    const subdomainInput = document.getElementsByClassName('create-team__team-subdomain-input')[0];

    const subdomainSuggestion = slugify(displayName);
    if (!subdomainInput.value && subdomainSuggestion.length) {
      subdomainInput.value = subdomainSuggestion;
    }

    function slugify(text) {
      return text.toString().toLowerCase().trim().replace(/&/g, '-and-').replace(/[\s\W-]+/g, '-');
    }
  }

  handleSubdomainChange(e) {
    const subdomain = e.target.value;
    const isTextEntered = subdomain && subdomain.length > 0;

    this.setState({
      subdomainLabelClass: (isTextEntered ? this.subdomainLabelClass('--text-entered') : this.subdomainLabelClass()),
    });

    // stubs pending real/API implementation; may need debouncing?
    const subdomainIsPending = false;
    const subdomainIsAvailable = false;
    const subdomainIsUnavailable = false;

    if (subdomainIsPending) {
      this.setState({
        subdomainClass: this.subdomainClass(),
        subdomainMessage: 'Checking availability...',
        buttonIsDisabled: true,
      });
    } else if (subdomainIsAvailable) {
      this.setState({
        subdomainClass: this.subdomainClass('--success'),
        subdomainMessage: 'Available!',
        buttonIsDisabled: false,
      });
    } else if (subdomainIsUnavailable) {
      this.setState({
        subdomainClass: this.subdomainClass('--error'),
        subdomainMessage: 'That URL is unavailable.',
        buttonIsDisabled: true,
      });
    } else {
      this.setState({
        subdomainClass: this.subdomainClass(),
        subdomainMessage: '',
        buttonIsDisabled: true,
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let that = this,
      name = document.getElementById('team-name-container').value,
      subdomain = document.getElementById('team-subdomain-container').value;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = 'Sorry, could not create the team';
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

      window.location.href = `${window.location.protocol}//${team.subdomain}.${config.selfHost}`;
    };

    Relay.Store.commitUpdate(
       new CreateTeamMutation({
         name,
         description: '',
         subdomain,
       }),
      { onSuccess, onFailure },
    );
  }

  componentDidMount() {
    this.teamNameInput.focus();
  }

  render() {
    return (
      <DocumentTitle title={pageTitle('Create a Team', true)}>
        <main className="create-team">
          <Message message={this.state.message} />
          <ContentColumn>
            <Heading>Create a Team</Heading>
            <p className="create-team__blurb">Create a team for your organization, or just for yourself:</p>
            <form className="create-team__form">
              <div className="create-team__team-display-name">
                <input
                  type="text"
                  name="teamDisplayName"
                  id="team-name-container"
                  className="create-team__team-display-name-input"
                  onChange={this.handleDisplayNameChange.bind(this)}
                  onBlur={this.handleDisplayNameBlur.bind(this)}
                  placeholder="Team Name"
                  autoComplete="off"
                  ref={input => this.teamNameInput = input}
                />
                <label className={this.state.displayNameLabelClass}>Team Name</label>
              </div>
              <div className="create-team__team-url">
                <div className={this.state.subdomainClass}>
                  <input
                    type="text"
                    name="teamSubdomain"
                    id="team-subdomain-container"
                    className="create-team__team-subdomain-input"
                    onChange={this.handleSubdomainChange.bind(this)}
                    placeholder="team-url"
                    autoComplete="off"
                  />
                  <label className={this.state.subdomainLabelClass}>Team URL</label>
                  <p className="create-team__team-subdomain-message">{this.state.subdomainMessage}</p>
                </div>
                <span className="create-team__root-domain">.checkmedia.org</span>
              </div>
              <button type="submit" onClick={this.handleSubmit.bind(this)} className="create-team__submit-button">Create</button>
            </form>
          </ContentColumn>
        </main>
      </DocumentTitle>
    );
  }
}

export default CreateTeam;
