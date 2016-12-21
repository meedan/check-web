import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Footer extends Component {
  render() {
    const about = this.props.about;
    return (
      <footer className="footer">
        <address>
          <span><Link to="/tos">Terms of Service</Link></span>
          <br />
          <span><i dangerouslySetInnerHTML={{ __html: about.name }} />, v<i dangerouslySetInnerHTML={{ __html: about.version }} /></span>
        </address>
      </footer>
    );
  }
}

export default Footer;
