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
