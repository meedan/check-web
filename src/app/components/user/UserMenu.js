import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui-next/Menu';
import UserUtil from './UserUtil';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import UserFeedback from '../UserFeedback';
import {
  black54,
  units,
} from '../../styles/js/shared';

const styles = {
  UserMenuStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: units(4),
    height: units(4),
    padding: 0,
    margin: `0 ${units(1)}`,
  },
};

class UserMenu extends React.Component {
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

    const role = inTeamContext && currentUserIsMember && UserUtil.userRole(user, team);
    const localizedRoleText = role &&
      <span className="user-menu__role" style={{ color: black54 }}>
        {`(${UserUtil.localizedRole(role, this.props.intl)})`}
      </span>;

    const { anchorEl } = this.state;

    return (
      <div className="header__user-menu">
        <IconButton
          style={styles.UserMenuStyle}
          onClick={this.handleClick}
        >
          <UserAvatar size={units(4)} {...this.props} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem
            containerElement={<Link to="/check/me" />}
            secondaryText={localizedRoleText}
          >
            {user && user.name}
          </MenuItem>
          <UserMenuItems {...this.props} />
          <UserFeedback />
        </Menu>
      </div>
    );
  }
}

UserMenu.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserMenu);
