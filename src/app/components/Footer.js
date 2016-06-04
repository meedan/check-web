import React, { Component, PropTypes } from 'react';

class Footer extends Component {
  render() {
    var about = this.props.about;
    console.log(about);
    return (
      <address>
        <span dangerouslySetInnerHTML={{__html: about.name}}></span>, v<span dangerouslySetInnerHTML={{__html: about.version}}></span>
      </address>
    );
  }
}

export default Footer;
