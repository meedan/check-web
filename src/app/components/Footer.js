import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { units } from '../styles/js/shared';

const StyledFooter = styled.footer`
  color: var(--textDisabled);
  margin: ${units(4)} 0;
  padding: ${units(1)} 0;
  text-align: center;
`;

const Footer = () => (
  <StyledFooter className="typography-caption">
    <FormattedMessage
      id="footer.madeBy"
      defaultMessage="Check: Verify breaking news online. Made with ✨ by {meedan}"
      description="Tagline shown on the bottom of the sign in or registration page"
      values={{
        meedan: <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a>,
      }}
    />
  </StyledFooter>
);

export default Footer;
