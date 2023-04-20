/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { stringHelper } from '../../customHelpers';
import styles from './DrawerHeader.module.css';

const messages = defineMessages({
  settingsDescription: {
    id: 'teamMenu.teamSettings',
    defaultMessage: 'Workspace settings',
    description: 'Tooltip for drawer navigation',
  },
});

const DrawerHeader = (props) => {
  if (!props.team) {
    return props.loggedIn ? (
      <div className={styles.drawerHeader}>
        <img height={31 /* file's real height */} alt="Team Logo" src={stringHelper('LOGO_URL')} />
      </div>
    ) : null;
  }

  return (
    <div className={styles.drawerHeader}>
      {props.currentUserIsMember ? (
        <Link
          className={`typography-button team-header__drawer-team-link ${styles.link}`}
          to={`/${props.team.slug}/settings/workspace`}
          title={props.intl.formatMessage(messages.settingsDescription)}
        >
          <span className={styles.teamName}>
            {props.team.name}
          </span>
        </Link>
      ) : null}
    </div>
  );
};
DrawerHeader.defaultProps = {
  team: null,
};
DrawerHeader.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }), // or null
  loggedIn: PropTypes.bool.isRequired,
  currentUserIsMember: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};
export default injectIntl(DrawerHeader);
