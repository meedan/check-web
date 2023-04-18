/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styles from './DrawerRail.module.css';

const DrawerRail = () => <div className={styles.drawerRail}>what up</div>;

DrawerRail.defaultProps = {
  team: null,
};
DrawerRail.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired, // for <TeamAvatar>
  }),
};
export default injectIntl(DrawerRail);
