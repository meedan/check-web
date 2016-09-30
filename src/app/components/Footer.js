import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Footer extends Component {
  render() {
    var about = this.props.about;
    return (
      <footer className='footer'>
        <address>
          <span><Link to="/tos">Terms of Service</Link></span>
          <br />
          <span><i dangerouslySetInnerHTML={{__html: about.name}}></i>, v<i dangerouslySetInnerHTML={{__html: about.version}}></i></span>
        </address>
      </footer>
    );
  }
}

export default Footer;
