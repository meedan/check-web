/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import TeamAvatar from '../team/TeamAvatar';
import { stringHelper } from '../../customHelpers';
import { units } from '../../styles/js/shared';
import styles from './DrawerHeader.module.css';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 1),
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    flex: '1 1 auto',
    overflow: 'hidden', // shrink when team name is too long
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logo: {
    flex: '0 0 auto',
    marginRight: theme.spacing(1),
  },
  settings: {
    flex: '0 0 auto',
  },
}));

const messages = defineMessages({
    settingsDescription: {
        id: 'teamMenu.teamSettings',
        defaultMessage: 'Workspace settings',
        description: 'Tooltip for drawer navigation',
    },
});

const DrawerHeader = (props, { team, loggedIn, currentUserIsMember }) => {
  const classes = useStyles();

  if (!props.team) {
    return props.loggedIn ? (
      <div className={classes.root}>
        <img height={31 /* file's real height */} alt="Team Logo" src={stringHelper('LOGO_URL')} />
      </div>
    ) : null;
  }

  return (
    <div className={classes.root}>
      {props.currentUserIsMember ? (
        <Link
          className={`typography-button team-header__drawer-team-link ${classes.link}`}
          to={`/${props.team.slug}/settings/workspace`}
          title={props.intl.formatMessage(messages.settingsDescription)}
        >
          <TeamAvatar className={classes.logo} size={units(5.5)} team={props.team} />
          <div className={styles.teamName}>
            {props.team.name}
          </div>
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
    avatar: PropTypes.string.isRequired, // for <TeamAvatar>
  }), // or null
  loggedIn: PropTypes.bool.isRequired,
  currentUserIsMember: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};
export default injectIntl(DrawerHeader);
