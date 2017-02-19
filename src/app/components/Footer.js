import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

class Footer extends Component {
  render() {
    const about = this.props.about;
    return (
      <footer className="footer">
        <span><FormattedMessage id="footer.madeBy" defaultMessage="Made with ✨ by" /> <a href="http://meedan.com">Meedan</a></span>
      </footer>
    );
  }
}

export default Footer;
