import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SearchKeywordContainer from './SearchKeywordContainer';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsIcon from '../../../icons/settings.svg';

const SearchKeywordMenu = ({
  onChange,
  query,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (value) => {
    onChange(value);
    handleClose();
  };

  return (
    <React.Fragment>
      <Tooltip arrow title={<FormattedMessage defaultMessage="Search settings" description="Button for search settings" id="SearchKeywordMenu.searchSettings" />}>
        <span>
          <ButtonMain
            iconCenter={<SettingsIcon />}
            size="small"
            theme="lightBeige"
            variant="text"
            onClick={e => setAnchorEl(e.currentTarget)}
          />
        </span>
      </Tooltip>
      { anchorEl ?
        <SearchKeywordContainer
          anchorEl={anchorEl}
          handleClose={handleClose}
          query={query}
          onDismiss={handleClose}
          onSubmit={handleChange}
        /> : null }
    </React.Fragment>
  );
};

SearchKeywordMenu.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchKeywordMenu;
