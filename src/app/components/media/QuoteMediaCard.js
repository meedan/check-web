import React from 'react';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import MoreLess from '../layout/MoreLess';
import ParsedText from '../ParsedText';
import { rtlClass } from '../../helpers';
import {
  breakWordStyles,
} from '../../styles/js/shared';

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  ${props =>
    props.quoteIsRtl ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'};
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
const QuoteMediaCard = (props) => {
  const {
    quote, languageCode,
  } = props;

  return (
    <div>
      <StyledQuoteText
        className={`quote__text ${rtlClass(languageCode)}`}
        quoteIsRtl={rtlDetect.isRtlLang(languageCode)}
      >
        <MoreLess>
          <ParsedText text={quote} />
        </MoreLess>
      </StyledQuoteText>
    </div>
  );
};

export default injectIntl(QuoteMediaCard);
