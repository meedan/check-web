import React, { Component, PropTypes } from 'react';

class ConfirmationLink extends Component {
  showConfirm() {
    document.getElementById('confirmation-box').style.display = 'block';
  }

	hideConfirm() {
    document.getElementById('confirmation-box').style.display = 'none';
	}

  executeAction() {
    var button = document.getElementById('confirm-button-yes');
    button.onclick = function() { return false; };
    button.innerHTML = 'Loading...';
    this.props.action();
    this.hideConfirm();
    button.onclick = this.executeAction;
    button.innerHTML = 'Yes';
  }

  render() {
    return (
      <a className="confirmation-link" id={this.props.id}>
        <span onClick={this.showConfirm.bind(this)}>{this.props.label}</span>
        <div className="hidden" id="confirmation-box">
          <p>Are you sure? This cannot be undone.</p>
          <p>
            <span className="confirm-button" id="confirm-button-yes" onClick={this.executeAction.bind(this)}>Yes</span>
            <span className="confirm-button cancel" onClick={this.hideConfirm.bind(this)}>Cancel</span>
          </p>
        </div>
      </a>
    );
  }
}

export default ConfirmationLink;
