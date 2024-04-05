import React from 'react';
import PropTypes from 'prop-types';
import FactCheckIcon from '../../../icons/fact_check.svg';
import styles from './Card.module.css';

const FactCheckUrl = ({
  factCheckUrl,
}) => (
  <span className={styles.factCheckLink}>
    <FactCheckIcon />
    <div>
      <a href={factCheckUrl} target="_blank" rel="noreferrer noopener">{factCheckUrl}</a>
    </div>
  </span>
);

FactCheckUrl.propTypes = {
  factCheckUrl: PropTypes.string.isRequired,
};

export default FactCheckUrl;
