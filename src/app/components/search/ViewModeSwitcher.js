import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ViewModeShorter from '../../icons/ViewModeShorter';
import ViewModeLonger from '../../icons/ViewModeLonger';
import { units } from '../../styles/js/shared';

const Styled = styled.div`
  .toolbar_view-mode {
    gap: ${units(1)};
  }

  .view-mode-switcher__view-mode-active {
    fill: #4F4F4F;
  }

  .view-mode-switcher__view-mode-inactive {
    fill: #D5D5D5;
  }

  .view-mode-switcher__button {
    margin: 0;
    padding: 0;
  }
`;

const ViewModeSwitcher = ({
  viewMode,
  onChangeViewMode,
}) => (
  <Styled>
    <Box className="toolbar_view-mode" display="flex" justifyContent="space-between">
      <Tooltip title={<FormattedMessage id="viewModeSwitcher.viewModeShorter" defaultMessage="See shorter titles" description="Tooltip for button that makes titles shorter" />}>
        <IconButton onClick={() => { onChangeViewMode('shorter'); }} className="view-mode-switcher__button">
          <ViewModeShorter className={viewMode === 'shorter' ? 'view-mode-switcher__view-mode-active' : 'view-mode-switcher__view-mode-inactive'} />
        </IconButton>
      </Tooltip>
      {' '}
      <Tooltip title={<FormattedMessage id="viewModeSwitcher.viewModeLonger" defaultMessage="See longer titles" description="Tooltip for button that makes titles shorter" />}>
        <IconButton onClick={() => { onChangeViewMode('longer'); }} className="view-mode-switcher__button">
          <ViewModeLonger className={viewMode === 'longer' ? 'view-mode-switcher__view-mode-active' : 'view-mode-switcher__view-mode-inactive'} />
        </IconButton>
      </Tooltip>
    </Box>
  </Styled>
);

ViewModeSwitcher.defaultProps = {
  viewMode: 'shorter',
};

ViewModeSwitcher.propTypes = {
  viewMode: PropTypes.oneOf(['shorter', 'longer']),
  onChangeViewMode: PropTypes.func.isRequired,
};

export default ViewModeSwitcher;
