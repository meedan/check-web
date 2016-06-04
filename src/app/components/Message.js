import React, { Component, PropTypes } from 'react';
import TopBar from './TopBar';

class Message extends Component {
  render() {
    const { close, state } = this.props;
    return (
      <div>
        <TopBar close={close} />
        <div class="textured">
          <img src={state.app.image ? ('images/' + state.app.image + '.svg') : '' } />
          <div className="message" dangerouslySetInnerHTML={{__html: state.app.message}}></div>
        </div>
      </div>
    );
  }
}

export default Message;
