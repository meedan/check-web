import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';

class Tos extends Component {
  render() {
    var about = this.props.about;
    return (
      <DocumentTitle title="Terms of Service (Check)">
        <div>
          <h2 className="main-title">Terms of Service</h2>
          <div id="tos" dangerouslySetInnerHTML={{__html: marked(about.tos)}}></div>
        </div>
      </DocumentTitle>
    );
  }
}

const TosContainer = Relay.createContainer(Tos, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        tos
      }
    `
  }
});

class TermsOfService extends Component {
  render() {
    var route = new AboutRoute();
    return (<Relay.RootContainer Component={TosContainer} route={route} />);
  }
}

export default TermsOfService;
