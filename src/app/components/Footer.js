import React, { Component, PropTypes } from 'react';
import { defineMessages } from 'react-intl';
import MappedMessage from './MappedMessage';

const messages = defineMessages({
  footer: {
    id: 'footer.madeBy',
    defaultMessage: 'Check: Verify breaking news online. Made with ✨ by',
  },
  bridge_footer: {
    id: 'bridge.footer.madeBy',
    defaultMessage: 'Bridge: Translate the global web. Made with ✨ by',
  }
});

class Footer extends Component {
  render() {
    const about = this.props.about;
    return (
      <footer className="footer">
        <span><MappedMessage msgObj={messages} msgKey="footer" /> <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a></span>
      </footer>
    );
  }
}

export default Footer;
