import React, { Component } from 'react';
import rtlDetect from 'rtl-detect';
import Helmet from 'react-helmet';

export default class RootLocale extends Component {
  render() {
    const stylesheet = rtlDetect.isRtlLang(this.props.locale) ? "/css/stylesheet-rtl.css" : "/css/stylesheet.css";
    return <Helmet
      htmlAttributes={{lang: this.props.locale}}
      link={[
        {rel: "stylesheet", href: stylesheet}
      ]}
    />
  }
}
