import React from 'react';
import { FormattedMessage } from 'react-intl';

const Footer = () => (
  <FormattedMessage
    defaultMessage="Check: Verify breaking news online. Made with ✨ by {meedan}"
    description="Tagline shown on the bottom of the sign in or registration page"
    id="footer.madeBy"
    tagName="footer"
    values={{
      meedan: <a href="http://meedan.com" rel="noopener noreferrer" target="_blank">Meedan</a>,
    }}
  />
);

export default Footer;
