import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { mapGlobalMessage } from './MappedMessage';
import Alert from './cds/alerts-and-prompts/Alert';

class BrowserSupport extends Component {
  static supported() {
    const ua = navigator.userAgent;

    if (/Chrome/i.test(ua) && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      return true;
    }
    return false;
  }

  static closed() {
    return window.storage.getValue('close-unsupported-browser-message') === '1';
  }

  static shouldShowMessage() {
    return !BrowserSupport.supported() && !BrowserSupport.closed() && window.parent === window;
  }

  close() {
    window.storage.set('close-unsupported-browser-message', '1');
    this.forceUpdate();
  }

  render() {
    if (BrowserSupport.shouldShowMessage()) {
      return (
        <Alert
          banner
          icon
          title={<FormattedMessage defaultMessage="{appName} is optimized for Google Chrome on desktop." description="Banner message encouraging users to use the Google Chrome browser, as their current browser is not supported" id="browserSupport.message" values={{ appName: mapGlobalMessage(this.props.intl, 'appNameHuman') }} />}
          variant="warning"
          onClose={this.close.bind(this)}
        />
      );
    }
    return null;
  }
}

export default injectIntl(BrowserSupport);
