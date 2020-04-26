import React from 'react';
import { defineMessages } from 'react-intl';
import styled from 'styled-components';
import MappedMessage from './MappedMessage';
import {
  opaqueBlack38,
  units,
  caption,
} from '../styles/js/shared';

const StyledFooter = styled.footer`
  color: ${opaqueBlack38};
  font: ${caption};
  margin: ${units(4)} 0;
  text-align: center;

  span {
    display: inline-block;
    margin: ${units(1)} 0;

    i {
      font-style: normal;
    }
  }

  a,
  a:hover {
    color: ${opaqueBlack38};
  }
`;

const messages = defineMessages({
  footer: {
    id: 'footer.madeBy',
    defaultMessage: 'Check: Verify breaking news online. Made with ✨ by',
  },
});

const Footer = () => (
  <StyledFooter className="footer">
    <span><MappedMessage msgObj={messages} msgKey="footer" /> <a target="_blank" rel="noopener noreferrer" href="http://meedan.com">Meedan</a></span>
  </StyledFooter>);

export default Footer;
