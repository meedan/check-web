import React from 'react';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import MoreLess from '../layout/MoreLess';
import ParsedText from '../ParsedText';
import { breakWordStyles } from '../../styles/js/shared';

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  ${props => props.dir === 'rtl' ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'};
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
const QuoteMediaCard = ({ quote, languageCode }) => (
  <div>
    <StyledQuoteText dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'} lang={languageCode}>
      <MoreLess key={quote /* reset when changing quote */}>
        <ParsedText text={quote} />
      </MoreLess>
    </StyledQuoteText>
  </div>
);
QuoteMediaCard.propTypes = {
};

export default QuoteMediaCard;
