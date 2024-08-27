/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import ParsedText from '../ParsedText';
import LongShort from '../layout/LongShort';

const QuoteMediaCard = ({ languageCode, quote, showAll }) => (
  <div
    className="quote-media-card"
    dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
    lang={languageCode}
  >
    <LongShort className="typography-body1" maxLines={6} showAll={showAll}>
      <ParsedText text={quote} />
    </LongShort>
  </div>
);
QuoteMediaCard.propTypes = {
  quote: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
