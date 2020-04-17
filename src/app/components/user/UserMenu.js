import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import UserUtil from './UserUtil';
import CheckContext from '../../CheckContext';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import {
  Text,
  black54,
  units,
  body1,
} from '../../styles/js/shared';

class UserMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClickEdit() {
    this.getHistory().push('/check/me/edit');
  }

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

    const role = inTeamContext && currentUserIsMember && UserUtil.userRole(user, team);
    const localizedRoleText = role &&
      <span className="user-menu__role" style={{ color: black54, marginLeft: units(1) }}>
        {`(${UserUtil.localizedRole(role, this.props.intl)})`}
      </span>;

    const { anchorEl } = this.state;

    return (
      <div className="header__user-menu">
        <MenuItem onClick={this.handleClick}>
          <ListItemAvatar>
            <UserAvatar size="extraSmall" {...this.props} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <div>
                <Text maxWidth="100%" font={body1} ellipsis>
                  <span style={{ maxWidth: '80%' }}>
                    {user ? user.name : null}
                  </span>
                  {localizedRoleText}
                </Text>
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

UserMenu.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserMenu);
