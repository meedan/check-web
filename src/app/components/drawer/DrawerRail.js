/* eslint-disable @calm/react-intl/missing-attribute */
import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import TeamAvatar from '../team/TeamAvatar';
import UserMenuRelay from '../../relay/containers/UserMenuRelay';
import styles from './DrawerRail.module.css';

const messages = defineMessages({
  settingsDescription: {
    id: 'teamMenu.teamSettings',
    defaultMessage: 'Workspace settings',
    description: 'Tooltip for drawer navigation',
  },
});

const DrawerRail = (props) => {
  const testPath = window.location.pathname;
  const isMediaPage = /\/media\/[0-9]+/.test(testPath);
  const isFeedPage = /\/feed\/[0-9]+\/(request|cluster)\/[0-9]+/.test(testPath);

  const {
    drawerOpen,
    onDrawerOpenChange,
    loggedIn,
  } = props;

  const setDrawerOpenChange = () => {
    onDrawerOpenChange(!drawerOpen);
    window.storage.set('drawer.isOpen', !drawerOpen);
  };

  useEffect(() => {
    if ((isMediaPage || isFeedPage) && props.drawerOpen) {
      onDrawerOpenChange(false);
    }
    else {
      if (window.storage.getValue('drawer.isOpen')) {
        onDrawerOpenChange(true);
      }
    }
  },[testPath]);

  return (
    <div className={styles.drawerRail}>
      <Link
        to={`/${props.team.slug}/settings/workspace`}
        title={props.intl.formatMessage(messages.settingsDescription)}>
        <TeamAvatar className={styles.teamLogo} size='44px' team={props.team} />
      </Link>
      <button onClick={setDrawerOpenChange}>{drawerOpen ? 'oo' : 'cc'}</button>
      <br />
      {window.storage.getValue('drawer.isOpen')}
      {loggedIn ? <div><UserMenuRelay {...props} /></div> : null}
    </div>
  );
};

export default injectIntl(DrawerRail);
