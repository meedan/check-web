import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import MdClear from 'react-icons/lib/md/clear';
import { mapGlobalMessage } from './MappedMessage';

import {
  ContentColumn,
  units,
  black54,
  white,
} from '../styles/js/shared';

const Message = styled.div`
  padding: ${units(1)};
  color: ${black54};
  background-color: ${white};
  > div {
    display: flex;
    align-items: center;
  }

  // Not sure why this is necessary for vertical alignment.
  // Is there a bug in IconButton? I think we are using it correctly.
  // - CGB 2017-7-12
  //
  button > div {
    display: flex;
    align-items: center;
  }
`;

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
    return !BrowserSupport.supported() && !BrowserSupport.closed();
  }

  close() {
    window.storage.set('close-unsupported-browser-message', '1');
    this.forceUpdate();
  }

  render() {
    if (BrowserSupport.shouldShowMessage()) {
      return (
        <Message>
          <ContentColumn>
            <IconButton style={{ fontSize: '20px', color: black54 }} onClick={this.close.bind(this)}>
              <MdClear />
            </IconButton>
            <div>
              <FormattedMessage id="browserSupport.message" defaultMessage="{appName} is optimized for Google Chrome on desktop." values={{ appName: mapGlobalMessage(this.props.intl, 'appNameHuman') }} />
            </div>
          </ContentColumn>
        </Message>
      );
    }
    return null;
  }
}

export default injectIntl(BrowserSupport);
