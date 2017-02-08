import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

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
    } else {
      return false;
    }
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
            <FormattedMessage id="browserSupport.message" defaultMessage="While in beta, Check is optimized for Google Chrome on desktop." />
          </p>
        </div>);
    } else {
      return null;
    }
  }
}

export default BrowserSupport;
