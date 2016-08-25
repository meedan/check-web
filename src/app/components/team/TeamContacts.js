import React, { Component, PropTypes } from 'react';

class TeamContacts extends Component {
  render() {
    return (
      <div><span>Worldwide{this.props.contacts.node.location}</span><span> | </span>
      <span>271-938-222</span><span> | </span>
      <span>meedan.com</span>
      </div>
    );
  }
}

export default TeamContacts;
