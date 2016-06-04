import React, { Component, PropTypes } from 'react';
// Without Relay:
// import Footer from './Footer';
import FooterRelay from '../relay/FooterRelay';

class Home extends Component {
  render() {
    const { close, state } = this.props;
    // Without Relay, render `Footer` directly instead of `FooterRelay` below:
    // let about = { name: 'Application Name', version: '0.0.1' };
    // <Footer {...this.props} about={about} />
    return (
      <div>
        <h1>Checkdesk</h1>
        <p>@Change to add your content here!</p>
        <p><small>Current URL: <span id="url" dangerouslySetInnerHTML={{__html: state.extension.url}}></span></small></p>
        <FooterRelay {...this.props} />
      </div>
    );
  }
}

export default Home;
