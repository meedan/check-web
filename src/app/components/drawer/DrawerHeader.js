import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';
import TeamAvatar from '../team/TeamAvatar';
import { stringHelper } from '../../customHelpers';
import {
  black87,
  subheading1,
  units,
  Text,
} from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 1),
    display: 'flex',
    alignItems: 'center',
  },
  logoAndName: {
    flex: '1 1 auto',
    overflow: 'hidden', // shrink when team name is too long
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    flex: '0 0 auto',
    marginRight: theme.spacing(1),
  },
  name: {
    flex: '1 1 auto',
    font: subheading1,
    fontWeight: 500,
    color: black87,
  },
  settings: {
    flex: '0 0 auto',
  },
}));

const LinkWithRef = React.forwardRef((props, ref) => <Link {...props} innerRef={ref} />);
LinkWithRef.displayName = 'LinkWithRef';

const DrawerHeader = ({ team, loggedIn, currentUserIsMember }) => {
  const classes = useStyles();

  if (!team) {
    return loggedIn ? (
      <div className={classes.root}>
        <img height={31 /* file's real height */} alt="Team Logo" src={stringHelper('LOGO_URL')} />
      </div>
    ) : null;
  }

  return (
    <div className={classes.root}>
      <Link
        className={`team-header__drawer-team-link ${classes.logoAndName}`}
        to={`/${team.slug}/`}
      >
        <TeamAvatar className={classes.logo} size={units(5.5)} team={team} />
        <Text ellipsis className={classes.name}>
          {team.name}
        </Text>
      </Link>
      {currentUserIsMember ? (
        <Tooltip title={
          <FormattedMessage id="teamMenu.teamSettings" defaultMessage="Workspace settings" />
        }
        >
          <IconButton
            className={`team-menu__team-settings-button ${classes.settings}`}
            component={LinkWithRef}
            to={`/${team.slug}/settings`}
            edge="end"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
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
};
export default DrawerHeader;
