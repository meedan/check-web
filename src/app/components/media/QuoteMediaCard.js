import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import ParsedText from '../ParsedText';
import { breakWordStyles } from '../../styles/js/shared';

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  text-align: start;
  max-height: ${props => props.showAll ? 'none' : '120px'}; // 6 (max-lines) x 20px (line-height)
  overflow: hidden;
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
const QuoteMediaCard = ({ quote, languageCode, showAll }) => (
  <div>
    <StyledQuoteText
      showAll={showAll}
      dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
      lang={languageCode}
    >
      <Typography variant="body1">
        <ParsedText text={quote} />
      </Typography>
    </StyledQuoteText>
  </div>
);
QuoteMediaCard.propTypes = {
  quote: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
