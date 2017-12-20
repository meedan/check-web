import React from 'react';
import Helmet from 'react-helmet';

const RootLocale = props =>
  <Helmet htmlAttributes={{ lang: props.locale }} />;

export default RootLocale;
