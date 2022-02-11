/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  opaqueBlack38,
  units,
  caption,
} from '../styles/js/shared';

const StyledFooter = styled.footer`
  color: ${opaqueBlack38};
  font: ${caption};
  margin: ${units(4)} 0;
  padding: ${units(1)} 0;
  text-align: center;
`;

const Footer = () => (
  <StyledFooter>
    <FormattedMessage
      id="footer.madeBy"
      defaultMessage="Check: Verify breaking news online. Made with ✨ by {meedan}"
      values={{
        meedan: <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a>,
      }}
    />
  </StyledFooter>
);

export default Footer;
