import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

const SourceActions = (props) => {
  const { source, handleRefresh } = props;
  const menuItems = [];

  if (can(source.permissions, 'update Source')) {
    menuItems.push((
      <MenuItem
        key="sourceActions.refresh"
        className="source-actions__refresh"
        id="source-actions__refresh"
        onClick={handleRefresh}
      >
        <FormattedMessage id="sourceActions.refresh" defaultMessage="Refresh" />
      </MenuItem>));
  }

  return menuItems.length ?
    <StyledIconMenuWrapper isRtl={rtlDetect.isRtlLang(props.intl.locale)}>
      <IconMenu
        className="source-actions"
        iconButtonElement={
          <IconButton>
            <IconMoreHoriz className="source-actions__icon" />
          </IconButton>}
      >
        {menuItems}
      </IconMenu>
    </StyledIconMenuWrapper>
    : null;
};

export default injectIntl(SourceActions);
