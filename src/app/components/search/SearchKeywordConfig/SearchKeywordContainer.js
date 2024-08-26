import React from 'react';
import Menu from '@material-ui/core/Menu';
import SearchKeywordConfigComponent from './SearchKeywordConfigComponent';

const SearchKeywordContainer = ({
  anchorEl,
  handleClose,
  onDismiss,
  onSubmit,
  query,
}) => (
  <Menu
    anchorEl={anchorEl}
    anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
    open={Boolean(anchorEl)}
    onClose={handleClose}
  >
    <SearchKeywordConfigComponent
      query={query}
      onDismiss={onDismiss}
      onSubmit={onSubmit}
    />
  </Menu>
);

export default SearchKeywordContainer;
