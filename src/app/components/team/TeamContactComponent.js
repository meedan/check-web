import React, { Component, PropTypes } from 'react';

class TeamContactComponent extends Component {
  render() {
    return (
      <div>
      el location {this.props.contact.location}
      </div>
    );
  }
}

export default TeamContactComponent;
