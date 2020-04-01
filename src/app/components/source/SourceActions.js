import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

class SourceActions extends React.Component {
  state = {};

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { source, handleRefresh } = this.props;
    const menuItems = [];

    if (can(source.permissions, 'update Source') && source.accounts.edges.length) {
      menuItems.push((
        <MenuItem
          key="sourceActions.refresh"
          className="source-actions__refresh"
          id="source-actions__refresh"
          onClick={handleRefresh}
        >
          <ListItemText
            primary={
              <FormattedMessage id="sourceActions.refresh" defaultMessage="Refresh" />
            }
          />
        </MenuItem>));
    }

    return menuItems.length ?
      <StyledIconMenuWrapper isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
        <IconButton
          onClick={this.handleOpenMenu}
        >
          <MoreHoriz className="source-actions__icon" />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
      </StyledIconMenuWrapper>
      : null;
  }
}

export default injectIntl(SourceActions);
