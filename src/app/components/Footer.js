import React from 'react';
import { FormattedMessage } from 'react-intl';

const Footer = () => (
  <FormattedMessage
    id="footer.madeBy"
    tagName="footer"
    defaultMessage="Check: Verify breaking news online. Made with ✨ by {meedan}"
    description="Tagline shown on the bottom of the sign in or registration page"
    values={{
      meedan: <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a>,
    }}
  />
);

export default Footer;
