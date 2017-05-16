import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import MappedMessage from './MappedMessage';

const messages = defineMessages({
  disclaimer: {
    id: "browserSupport.message",
    defaultMessage: "While in beta, Check is optimized for Google Chrome on desktop.",
  },
  bridge_disclaimer: {
    id: "bridge.browserSupport.message",
    defaultMessage: "While in beta, Bridge is optimized for Google Chrome on desktop.",
  },
});

class BrowserSupport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      closed: this.closed(),
    };
  }

  supported() {
    const ua = navigator.userAgent;

    if (/Chrome/i.test(ua) && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      return true;
    }
    return false;
  }

  closed() {
    const closed = window.storage.getValue('close-unsupported-browser-message') === '1';
    return closed;
  }

  close() {
    window.storage.set('close-unsupported-browser-message', '1');
    this.setState({ closed: true });
  }

  shouldShowMessage() {
    return !this.supported() && !this.closed();
  }

  render() {
    if (this.shouldShowMessage()) {
      return (
        <div className="browser-support">
          <span className="browser-support__close" onClick={this.close.bind(this)}>×</span>
          <p className="browser-support__message">
            <MappedMessage msgObj={messages} msgKey="disclaimer" />
          </p>
        </div>);
    }
    return null;
  }
}

export default BrowserSupport;
