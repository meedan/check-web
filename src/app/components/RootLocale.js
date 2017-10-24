import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class RootLocale extends Component {
  render() {
    return (<Helmet
      htmlAttributes={{ lang: this.props.locale }}
    />);
  }
}
