import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import ParsedText from '../ParsedText';
import { breakWordStyles } from '../../styles/js/shared';
import LongShort from '../layout/LongShort';

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  text-align: start;
  overflow: hidden;
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
const QuoteMediaCard = ({ quote, languageCode, showAll }) => (
  <div className="quote-media-card">
    <LongShort showAll={showAll}>
      <StyledQuoteText
        dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
        lang={languageCode}
      >
        <Typography variant="body1">
          <ParsedText text={quote} />
        </Typography>
      </StyledQuoteText>
    </LongShort>
  </div>
);
QuoteMediaCard.propTypes = {
  quote: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
