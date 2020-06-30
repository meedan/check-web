import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TeamAvatar from './TeamAvatar';
import { HeaderTitle, headerHeight } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: headerHeight,
  },
  avatarWrapper: {
    padding: `${theme.spacing(0, 1)}`,
  },
}));

export default function TeamHeaderComponent(props) {
  const classes = useStyles();
  const settingsPage = props.children.props.route.path === ':team/settings';
  const hideTeamName = /(.*\/project\/[0-9]+)/.test(window.location.pathname) || settingsPage;
  const { team } = props;

  if (!team) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div className={classes.avatarWrapper}>
        <TeamAvatar team={team} />
      </div>
      {hideTeamName ? null : (
        <HeaderTitle>{team.name}</HeaderTitle>
      )}
    </div>
  );
}
