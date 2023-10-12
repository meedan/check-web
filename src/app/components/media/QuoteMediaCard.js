import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import ParsedText from '../ParsedText';
import LongShort from '../layout/LongShort';

const QuoteMediaCard = ({ quote, languageCode, showAll }) => (
  <div
    className="quote-media-card"
    dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
    lang={languageCode}
  >
    <LongShort className="typography-body1" showAll={showAll} maxLines={6}>
      <ParsedText text={quote} />
    </LongShort>
  </div>
);
QuoteMediaCard.propTypes = {
  quote: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
