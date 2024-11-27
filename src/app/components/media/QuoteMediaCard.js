import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import cx from 'classnames/bind';
import ParsedText from '../ParsedText';
import styles from './MediaCardLarge.module.css';

const QuoteMediaCard = ({ languageCode, quote }) => (
  <div
    className={cx('quote-media-card', styles['quote-mediacard'])}
    dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'}
    lang={languageCode}
  >
    <blockquote>
      <ParsedText text={quote} />
    </blockquote>
  </div>
);
QuoteMediaCard.propTypes = {
  languageCode: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
