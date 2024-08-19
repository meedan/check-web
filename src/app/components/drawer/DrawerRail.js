import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { injectIntl, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import TeamAvatar from '../team/TeamAvatar';
import HelpIcon from '../../icons/help.svg';
import InfoIcon from '../../icons/info.svg';
import QuestionAnswerIcon from '../../icons/question_answer.svg';
import SettingsIcon from '../../icons/settings.svg';
import PersonIcon from '../../icons/person.svg';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import ChevronLeftIcon from '../../icons/chevron_left.svg';
import DescriptionIcon from '../../icons/description.svg';
import styles from './DrawerRail.module.css';

const messages = defineMessages({
  settingsDescription: {
    id: 'workspaceMenu.teamSettings',
    defaultMessage: 'Workspace settings',
    description: 'Tooltip for drawer navigation to workspace settings',
  },
  userSettingsDescription: {
    id: 'workspaceMenu.userSettings',
    defaultMessage: 'User settings',
    description: 'Tooltip for drawer navigation to user settings',
  },
  railToggleDescription: {
    id: 'workspaceMenu.railToggle',
    defaultMessage: 'Show/Hide navigation',
    description: 'Tooltip for toggling open or closed the drawer navigation',
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
    defaultMessage: 'About Meedan',
    description: 'Legal link tooltip in drawer rail navigation',
  },
  feedDescription: {
    id: 'workspaceMenu.teamFeeds',
    defaultMessage: 'Shared Feeds',
    description: 'Tooltip for drawer navigation to shared feeds',
  },
  articlesDescription: {
    id: 'drawerRail.articlesDescription',
    defaultMessage: 'Articles',
    description: 'Tooltip for the Articles rail navigation',
  },
});

const DrawerRail = (props) => {
  const testPath = window.location.pathname;
  const isSettingsPage = /[^/]+\/settings?/.test(testPath);
  const isArticlePage = /[^/]+\/articles?/.test(testPath);
  const isFeedPage = /^\/[^/]+\/feed(s)?($|\/)/.test(testPath);
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;
  const isUserSettingsPage = teamSlug === 'check';
  const isTipline = !isUserSettingsPage && !isSettingsPage && !isFeedPage && !isArticlePage;
  const pathParts = testPath.split('/');
  const [activeItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });

  const {
    currentUserIsMember,
    drawerOpen,
    drawerType,
    onDrawerOpenChange,
    onDrawerTypeChange,
    team,
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
    window.storage.set('drawer.isOpen', !drawerOpen);
  };

  useEffect(() => {
    if (!!team && (currentUserIsMember || !team.private)) {
      if (!teamSlug) {
        onDrawerOpenChange(false);
        window.storage.set('drawer.isOpen', false);
      } else if (window.storage.getValue('drawer.isOpen')) {
        onDrawerOpenChange(true);
        window.storage.set('drawer.isOpen', true);
      }

      if (isSettingsPage) {
        onDrawerTypeChange('settings');
      } else if (isFeedPage) {
        onDrawerTypeChange('feed');
      } else if (isUserSettingsPage) {
        onDrawerTypeChange('user');
      } else if (isArticlePage) {
        onDrawerTypeChange('articles');
      } else {
        onDrawerTypeChange('tipline');
      }
    }
  }, [testPath, teamSlug, activeItem]);

  return (
    <div className={styles.drawerRail}>
      {!!team && (currentUserIsMember || !team.private) ? (
        <>
          <div className={styles.drawerRailTop}>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.settingsDescription)}>
              <Link
                className="team-header__drawer-team-link"
                to={`/${props.team.slug}/settings/workspace`}
              >
                <TeamAvatar className={styles.teamLogo} size="44px" team={props.team} />
              </Link>
            </Tooltip>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.railToggleDescription)}>
              <button
                className={cx(
                  [styles.railIconButton],
                  {
                    'side-navigation__toggle-open': drawerOpen,
                    'side-navigation__toggle-closed': !drawerOpen,
                  })
                }
                id="side-navigation__toggle"
                type="button"
                onClick={() => setDrawerOpenChange()}
              >
                {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </button>
            </Tooltip>
          </div>
          <div className={styles.drawerRailMiddle}>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.articlesDescription)}>
              <Link
                className={cx(
                  [styles.railIconLink],
                  {
                    [styles.railIconLinkActive]: isArticlePage,
                  })
                }
                id="side-navigation__article-toggle"
                to={`/${props.team.slug}/articles/fact-checks`}
                onClick={() => setDrawerTypeChange('articles')}
              >
                <DescriptionIcon />
              </Link>
            </Tooltip>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.tiplineDescription)}>
              <Link
                className={cx(
                  [styles.railIconLink],
                  {
                    [styles.railIconLinkActive]: isTipline,
                  })
                }
                id="side-navigation__tipline-toggle"
                to={`/${props.team.slug}/all-items`}
                onClick={() => setDrawerTypeChange('tipline')}
              >
                <QuestionAnswerIcon />
              </Link>
            </Tooltip>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.feedDescription)}>
              <Link
                className={cx(
                  [styles.railIconLink],
                  {
                    [styles.railIconLinkActive]: isFeedPage,
                  })
                }
                id="side-navigation__feed-toggle"
                to={`/${props.team.slug}/feeds`}
                onClick={() => setDrawerTypeChange('feed')}
              >
                <SharedFeedIcon />
              </Link>
            </Tooltip>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.settingsDescription)}>
              <Link
                className={cx(
                  [styles.railIconLink],
                  {
                    [styles.railIconLinkActive]: isSettingsPage,
                  })
                }
                to={`/${props.team.slug}/settings/workspace`}
                onClick={() => setDrawerTypeChange('settings')}
              >
                <SettingsIcon />
              </Link>
            </Tooltip>
            <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.userSettingsDescription)}>
              <Link
                className={cx(
                  'user-menu__avatar',
                  [styles.railIconLink],
                  {
                    [styles.railIconLinkActive]: isUserSettingsPage,
                  })
                }
                to="/check/me/profile"
                onClick={() => setDrawerTypeChange('user')}
              >
                <PersonIcon />
              </Link>
            </Tooltip>
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
        <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.trainingDescription)}>
          <a
            className={styles.railIconLink}
            href="https://help.checkmedia.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <HelpIcon />
          </a>
        </Tooltip>
        <Tooltip arrow placement="right" title={props.intl.formatMessage(messages.legalDescription)}>
          <a
            className={styles.railIconLink}
            href="https://meedan.com/legal"
            rel="noopener noreferrer"
            target="_blank"
          >
            <InfoIcon />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default injectIntl(DrawerRail);
