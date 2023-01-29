/* eslint-disable relay/unused-fields */
import React from 'react';
import Menu from '@material-ui/core/Menu';
import SearchKeywordConfigComponent from './SearchKeywordConfigComponent';

const SearchKeywordContainer = ({
  onDismiss,
  onSubmit,
  query,
  anchorEl,
  handleClose,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
  >
    <SearchKeywordConfigComponent
      onDismiss={onDismiss}
      onSubmit={onSubmit}
      query={query}
    />
  </Menu>
);

export default SearchKeywordContainer;
