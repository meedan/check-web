import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SearchKeywordContainer from './SearchKeywordContainer';
import SettingsIcon from '../../../icons/settings.svg';

const SearchKeywordMenu = ({
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
      <Tooltip arrow title={<FormattedMessage id="SearchKeywordMenu.searchSettings" defaultMessage="Search settings" description="Button for search settings" />}>
        <span>
          <ButtonMain
            iconCenter={<SettingsIcon />}
            size="small"
            variant="text"
            theme="lightText"
            onClick={e => setAnchorEl(e.currentTarget)}
          />
        </span>
      </Tooltip>
      { anchorEl ?
        <SearchKeywordContainer
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
