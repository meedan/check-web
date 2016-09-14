import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';

class BrowserSupport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      closed: this.closed()
    };
  }

  supported() {
    const ua = navigator.userAgent;

    if (/Chrome/i.test(ua) && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      return true;
    }
    else {
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

  toggleBodyClass() {
    if (this.shouldShowMessage()) {
      document.body.classList.add('with-unsupported-browser-message');
    }
    else {
      document.body.classList.remove('with-unsupported-browser-message');
    }
  }

  componentWillMount() {
    this.toggleBodyClass();
  }

  componentWillUpdate() {
    this.toggleBodyClass();
  }

  shouldShowMessage() {
    return !this.supported() && !this.closed();
  }

  render() {
    if (this.shouldShowMessage()) {
      return (
        <div className='unsupported-browser'>
          <span>Check is optimized for Google Chrome on desktop </span>
          <FontAwesome name='close' onClick={this.close.bind(this)} />
        </div>);
    }
    else {
      return null;
    }
  }
}

export default BrowserSupport;
