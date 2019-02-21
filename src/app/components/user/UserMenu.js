import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconEdit from 'material-ui/svg-icons/image/edit';
import UserUtil from './UserUtil';
import CheckContext from '../../CheckContext';
import UserMenuItems from '../UserMenuItems';
import UserAvatar from '../UserAvatar';
import UserFeedback from '../UserFeedback';
import {
  black54,
  units,
  Row,
  SmallerStyledIconButton,
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
    const { pathname } = window.location;
    const { tab } = this.props.params || {};

    return (
      <div className="header__user-menu">
        <Row>
          { pathname === '/check/me' || (pathname.startsWith('/check/me') && typeof tab !== 'undefined') ?
            <SmallerStyledIconButton
              className="user-menu__edit-profile-button"
              onClick={this.handleClickEdit.bind(this)}
              tooltip={
                <FormattedMessage id="userMenu.edit" defaultMessage="Edit profile" />
              }
            >
              <IconEdit />
            </SmallerStyledIconButton> : null
          }
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
              style={{ maxWidth: '350px', whiteSpace: 'normal' }}
            >
              <div>
                {user ? user.name : null}
                {localizedRoleText}
              </div>
            </MenuItem>
            <UserMenuItems {...this.props} />
            <UserFeedback />
          </Menu>
        </Row>
      </div>
    );
  }
}

UserMenu.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserMenu);
