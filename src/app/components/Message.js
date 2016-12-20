import React, { Component, PropTypes } from 'react';

class Message extends Component {
  render() {
    const { message } = this.props;
    if (message) {
      return (<div className="message" dangerouslySetInnerHTML={{ __html: message }} />);
    } else {
      return null;
    }
  }
}

export default Message;
