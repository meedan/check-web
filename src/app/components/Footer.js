import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

class Footer extends Component {
  render() {
    const about = this.props.about;
    return (
      <footer className="footer">
        <span><FormattedMessage id="footer.madeBy" defaultMessage="Check: Verify breaking news online. Made with ✨ by" /> <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a></span>
      </footer>
    );
  }
}

export default Footer;
