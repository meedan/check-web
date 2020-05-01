import React from 'react';
import { Helmet } from 'react-helmet';

const RootLocale = ({ locale }) => (
  <Helmet>
    <html lang={locale} />
  </Helmet>
);

export default RootLocale;
