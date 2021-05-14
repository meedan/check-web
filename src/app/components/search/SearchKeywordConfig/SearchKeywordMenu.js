import React from 'react';
import PropTypes from 'prop-types';
import SettingsIcon from '@material-ui/icons/Settings';
import SearchKeywordContainer from './SearchKeywordContainer';

const SearchKeywordMenu = ({
  teamSlug,
  query,
  onChange,
  anchorParent,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (value) => {
    onChange(value);
    handleClose();
  };

  return (
    <React.Fragment>
      <SettingsIcon onClick={() => setAnchorEl(anchorParent)} />
      <SearchKeywordContainer
        teamSlug={teamSlug}
        query={query}
        onDismiss={handleClose}
        onSubmit={handleChange}
        anchorEl={anchorEl}
        handleClose={handleClose}
      />
    </React.Fragment>
  );
};

SearchKeywordMenu.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchKeywordMenu;
