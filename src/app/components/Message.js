import React, { Component, PropTypes } from 'react';

class Message extends Component {
  render() {
    const { state } = this.props;
    if (state.app.message) {
      return (<div className="message" dangerouslySetInnerHTML={{__html: state.app.message}}></div>);
    }
    else {
      return null;
    }
  }
}

export default Message;
