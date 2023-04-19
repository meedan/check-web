import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { LocalizedRole, userRole } from './UserUtil';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import styles from './user.module.css';

export default class UserMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const {
      currentUserIsMember, inTeamContext, loggedIn, user, team,
    } = this.props;

    if (!loggedIn) {
      return null;
    }

    const role = inTeamContext && currentUserIsMember && userRole(user, team);
    const { anchorEl } = this.state;

    return (
      <div className="header__user-menu">
        <MenuItem onClick={this.handleClick}>
          <ListItemAvatar>
            <UserAvatar size="extraSmall" {...this.props} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <div className={['typography-body1', styles.userNameRole].join(' ')}>
                <span className={styles.userName}>
                  {user ? user.name : null}
                </span>
                {role ? (
                  <span className={['user-menu__role', styles.userRole].join(' ')}>
                    <LocalizedRole role={role} />
                  </span>
                ) : null}
              </div>
            }
          />
        </MenuItem>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <UserMenuItems {...this.props} />
        </Menu>
      </div>
    );
  }
}
