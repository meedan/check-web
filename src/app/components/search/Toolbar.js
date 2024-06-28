import React from 'react';
import { injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import searchResultsStyles from './SearchResults.module.css';

const Toolbar = ({
  title,
  resultType,
}) => (
  <div className={cx(searchResultsStyles['search-results-toolbar'], 'toolbar', `toolbar__${resultType}`)}>
    {title}
  </div>
);

export default injectIntl(Toolbar);
