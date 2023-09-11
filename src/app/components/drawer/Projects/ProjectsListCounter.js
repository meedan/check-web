import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import styles from './Projects.module.css';

const ProjectsListCounter = ({ numberOfItems, intl }) => (
  <ListItemSecondaryAction title={numberOfItems} className={styles.listItemCount}>
    <small>
      { !Number.isNaN(parseInt(numberOfItems, 10)) ?
        new Intl.NumberFormat(intl.locale, { notation: 'compact', compactDisplay: 'short' }).format(numberOfItems) : null }
    </small>
  </ListItemSecondaryAction>
);

ProjectsListCounter.propTypes = {
  numberOfItems: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ProjectsListCounter);
