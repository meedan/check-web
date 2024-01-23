import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { injectIntl, defineMessages } from 'react-intl';
import Avatar from '@material-ui/core/Avatar';
import TeamAvatar from '../team/TeamAvatar';
import HelpIcon from '../../icons/help.svg';
import InfoIcon from '../../icons/info.svg';
import QuestionAnswerIcon from '../../icons/question_answer.svg';
import SettingsIcon from '../../icons/settings.svg';
import FeedIcon from '../../icons/dynamic_feed.svg';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import ChevronLeftIcon from '../../icons/chevron_left.svg';
import styles from './DrawerRail.module.css';

const messages = defineMessages({
  settingsDescription: {
    id: 'workspaceMenu.teamSettings',
    defaultMessage: 'Workspace settings',
    description: 'Tooltip for drawer navigation to workspace settings',
  },
  tiplineDescription: {
    id: 'workspaceMenu.teamTipline',
    defaultMessage: 'Tipline',
    description: 'Tooltip for drawer navigation to tipline',
  },
  trainingDescription: {
    id: 'workspaceMenu.teamTraining',
    defaultMessage: 'Training and documentation',
    description: 'Help link tooltip in drawer rail navigation',
  },
  legalDescription: {
    id: 'workspaceMenu.teamLegal',
    defaultMessage: 'About',
    description: 'Legal link tooltip in drawer rail navigation',
  },
  feedDescription: {
    id: 'workspaceMenu.teamFeeds',
    defaultMessage: 'Shared Feeds',
    description: 'Tooltip for drawer navigation to shared feeds',
  },
});

const DrawerRail = (props) => {
  const testPath = window.location.pathname;
  const isSettingsPage = /\/settings\/[a-zA-Z0-9]+/.test(testPath);
  const isMediaPage = /\/media\/[0-9]+/.test(testPath);
  const isFeedPage = /^\/[^/]+\/feed(s)?($|\/)/.test(testPath);
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;
  const isUserSettingsPage = teamSlug === 'check';
  const isTipline = !isUserSettingsPage && !isSettingsPage && !isFeedPage;
  const pathParts = testPath.split('/');
  const [activeItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });

  const {
    drawerOpen,
    drawerType,
    onDrawerTypeChange,
    onDrawerOpenChange,
    team,
    currentUserIsMember,
  } = props;

  const setDrawerTypeChange = (newDrawerType) => {
    const currentDrawerType = drawerType;
    // if drawer is open and we click on the other button, change the content
    if (drawerOpen && currentDrawerType !== newDrawerType) {
      onDrawerTypeChange(newDrawerType);
    }
  };

  const setDrawerOpenChange = () => {
    onDrawerOpenChange(!drawerOpen);
  };

  useEffect(() => {
    if (!!team && (currentUserIsMember || !team.private)) {
      if (isMediaPage || isSettingsPage || teamSlug === 'check' || !teamSlug) {
        onDrawerOpenChange(false);
      } else if (window.storage.getValue('drawer.isOpen')) {
        onDrawerOpenChange(true);
      }
      if (isFeedPage) {
        onDrawerTypeChange('feed');
      } else {
        onDrawerTypeChange('default');
      }
    }
  }, [testPath, teamSlug, activeItem]);

  // eslint-disable-next-line
  console.log(isFeedPage)

  return (
    <div className={styles.drawerRail}>
      {!!team && (currentUserIsMember || !team.private) ? (
        <>
          <div className={styles.drawerRailTop}>
            <Link
              className="team-header__drawer-team-link"
              to={`/${props.team.slug}/settings/workspace`}
              title={props.intl.formatMessage(messages.settingsDescription)}
            >
              <TeamAvatar className={styles.teamLogo} size="44px" team={props.team} />
            </Link>
            <button type="button" className={`${styles.railIconButton} ${drawerOpen ? 'side-navigation__toggle-open' : 'side-navigation__toggle-closed'}`} id="side-navigation__toggle" onClick={() => setDrawerOpenChange()}>{drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}</button>
          </div>
          <div className={styles.drawerRailMiddle}>
            <Link
              className={[styles.railIconLink, isTipline ? styles.railIconLinkActive : ''].join(' ')}
              to={`/${props.team.slug}/all-items`}
              onClick={() => setDrawerTypeChange('default')}
              title={props.intl.formatMessage(messages.tiplineDescription)}
            >
              <QuestionAnswerIcon />
            </Link>
            <Link
              className={`${styles.railIconLink} ${isFeedPage ? styles.railIconLinkActive : ''}`}
              id="side-navigation__feed-toggle"
              onClick={() => setDrawerTypeChange('feed')}
              to={`/${props.team.slug}/feeds`}
              title={props.intl.formatMessage(messages.feedDescription)}
            >
              <FeedIcon />
            </Link>
            <Link
              className={[styles.railIconLink, isSettingsPage ? styles.railIconLinkActive : ''].join(' ')}
              to={`/${props.team.slug}/settings`}
              title={props.intl.formatMessage(messages.settingsDescription)}
            >
              <SettingsIcon />
            </Link>
          </div>
        </>
      ) :
        <>
          <div className={styles.drawerRailTop}>
            &nbsp;
          </div>
          <div className={styles.drawerRailMiddle}>
            &nbsp;
          </div>
        </>
      }
      <div className={styles.drawerRailBottom}>
        <a
          href="https://help.checkmedia.org/"
          className={styles.railIconLink}
          target="_blank"
          rel="noopener noreferrer"
          title={props.intl.formatMessage(messages.trainingDescription)}
        >
          <HelpIcon />
        </a>
        <a
          href="https://meedan.com/legal"
          className={styles.railIconLink}
          target="_blank"
          rel="noopener noreferrer"
          title={props.intl.formatMessage(messages.legalDescription)}
        >
          <InfoIcon />
        </a>
        <Link
          className={['user-menu__avatar', styles.railUserSettings, isUserSettingsPage ? styles.railUserSettingsActive : ''].join(' ')}
          to="/check/me"
        >
          <Avatar alt={props.user.name} src={props.user.profile_image} />
        </Link>
      </div>
    </div>
  );
};

export default injectIntl(DrawerRail);
