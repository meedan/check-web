import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { getCompactNumber } from '../../../helpers';
import styles from './Projects.module.css';

const DrawerListCounter = ({ intl, numberOfItems }) => (
  <div className={styles.listItemCount} title={numberOfItems}>
    <small>
      { !Number.isNaN(parseInt(numberOfItems, 10)) ?
        getCompactNumber(intl.locale, numberOfItems) : null }
    </small>
  </div>
);

DrawerListCounter.propTypes = {
  intl: intlShape.isRequired,
  numberOfItems: PropTypes.number.isRequired,
};

export default injectIntl(DrawerListCounter);
