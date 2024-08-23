/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { getCompactNumber } from '../../../helpers';
import styles from './Projects.module.css';

const ProjectsListCounter = ({ intl, numberOfItems }) => (
  <div className={styles.listItemCount} title={numberOfItems}>
    <small>
      { !Number.isNaN(parseInt(numberOfItems, 10)) ?
        getCompactNumber(intl.locale, numberOfItems) : null }
    </small>
  </div>
);

ProjectsListCounter.propTypes = {
  numberOfItems: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ProjectsListCounter);
