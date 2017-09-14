import React, { Component, PropTypes } from 'react';

class Message extends Component {
  render() {
    const { message, onClick } = this.props;
    if (message) {
      if (typeof message === 'string' || message instanceof String) {
        return (<div dangerouslySetInnerHTML={{ __html: message }} onClick={onClick} className={`message ${this.props.className}`} />);
      }
      else {
        return (
          <div onClick={onClick} className={`message ${this.props.className}`}>
            {message}
          </div>
        );
      }
    }
    return null;
  }
}

export default Message;
