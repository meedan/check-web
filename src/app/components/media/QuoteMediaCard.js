import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import cx from 'classnames/bind';
import ParsedText from '../ParsedText';
import LongShort from '../layout/LongShort';
import styles from './MediaCardLarge.module.css';

const QuoteMediaCard = ({ languageCode, quote, showAll }) => (
  <div
    className={cx('quote-media-card', styles['quote-mediacard'])}
    dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
    lang={languageCode}
  >
    <LongShort className="typography-body1" maxLines={6} showAll={showAll}>
      <ParsedText text={quote} />
    </LongShort>
  </div>
);
QuoteMediaCard.propTypes = {
  languageCode: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
