import React from 'react';
import PropTypes from 'prop-types';
import SettingsIcon from '@material-ui/icons/Settings';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import SearchKeywordContainer from './SearchKeywordContainer';

const SearchKeywordMenu = ({
  teamSlug,
  query,
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (value) => {
    onChange(value);
    handleClose();
  };

  return (
    <React.Fragment>
      <Button
        startIcon={<SettingsIcon />}
        component="span"
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FormattedMessage
          id="SearchKeywordMenu.advanced"
          defaultMessage="Advanced"
          description="Button for advanced search"
        />
      </Button>
      { anchorEl ?
        <SearchKeywordContainer
          teamSlug={teamSlug}
          query={query}
          onDismiss={handleClose}
          onSubmit={handleChange}
          anchorEl={anchorEl}
          handleClose={handleClose}
        /> : null }
    </React.Fragment>
  );
};

SearchKeywordMenu.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchKeywordMenu;
