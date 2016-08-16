import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateTeamMutation from '../../relay/CreateTeamMutation';
import base64 from 'base-64';
import Message from '../Message';


class CreateTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNameLabelClass: this.displayNameLabelClass(),
      subdomainClass: this.subdomainClass(),
      subdomainLabelClass: this.subdomainLabelClass(),
      subdomainMessage: '',
      buttonIsDisabled: true
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
    this.setState({displayNameLabelClass: newClass});
  }

  handleSubdomainChange(e) {
    const subdomain = e.target.value;
    const isTextEntered = subdomain && subdomain.length > 0;

    this.setState({
      subdomainLabelClass: (isTextEntered ? this.subdomainLabelClass('--text-entered') : this.subdomainLabelClass())
    });

    // stubs pending real/API implementation; may need debouncing?
    var subdomainIsPending = false;
    var subdomainIsAvailable = false;
    var subdomainIsUnavailable = false;

    if (subdomainIsPending) {
      this.setState({
        subdomainClass: this.subdomainClass(),
        subdomainMessage: 'Checking availability...',
        buttonIsDisabled: true
      });
    } else if (subdomainIsAvailable) {
      this.setState({
        subdomainClass: this.subdomainClass('--success'),
        subdomainMessage: 'Available!',
        buttonIsDisabled: false
      });
    } else if (subdomainIsUnavailable) {
      this.setState({
        subdomainClass: this.subdomainClass('--error'),
        subdomainMessage: 'That URL is unavailable.',
        buttonIsDisabled: true
      });
    } else {
      this.setState({
        subdomainClass: this.subdomainClass(),
        subdomainMessage: '',
        buttonIsDisabled: true
      });
    }
  }

  handleSubmit(e) {
     e.preventDefault();
     console.log("handleSubmit");
     var that = this,
         name = document.getElementById('team-name-container').value;
         console.log("HandleSubmit")

     var onFailure = (transaction) => {

         console.log("onFailure")
         transaction.getError().json().then(function(json) {
           var message = 'Sorry, could not create the team';
           if (json.error) {
             message = json.error;
           }
           that.setState({ message: message });
         });

     };

     var onSuccess = (response) => {
       console.log("onSuccess")
       var tid = response.createTeam.team.id;
       var decodedId = base64.decode(tid);
       this.props.history.push('/' + decodedId);
       this.setState({ message: null });

     };

     Relay.Store.commitUpdate(
       new CreateTeamMutation({
        name: name,
        description: ""
      }),
      { onSuccess, onFailure }
    );
  }


  render() {
    return (
      <main className='create-team'>
        <Message message={this.state.message} />

        <img className='create-team__icon' src='/images/logo/logo-alt.svg'/>
        <h1 className='create-team__heading'>Create a Team</h1>
        <p className='create-team__blurb'>Create a team for your organization, or just for yourself:</p>

        <form className='create-team__form'>
          <div className='create-team__team-display-name'>
            <input type='text' name='teamDisplayName' id="team-name-container" className='create-team__team-display-name-input' onChange={this.handleDisplayNameChange.bind(this)} placeholder='Team Name' autocomplete="off" />
            <label className={this.state.displayNameLabelClass}>Team Name</label>
          </div>

          <div className='create-team__team-url'>
            <div className={this.state.subdomainClass}>
              <input type='text' name='teamSubdomain' className='create-team__team-subdomain-input' onChange={this.handleSubdomainChange.bind(this)} placeholder='team-url' autocomplete="off" />
              <label className={this.state.subdomainLabelClass}>Team URL</label>
              <p className='create-team__team-subdomain-message'>{this.state.subdomainMessage}</p>
            </div>
            <span className='create-team__root-domain'>.checkdesk.org</span>
          </div>

          <button type='submit' onClick={this.handleSubmit.bind(this)} className='create-team__submit-button'>Create</button>
        </form>
      </main>

    );
  }
}

export default CreateTeam;
