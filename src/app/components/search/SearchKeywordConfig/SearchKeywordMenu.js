import React from 'react';
import PropTypes from 'prop-types';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import SearchKeywordContainer from './SearchKeywordContainer';

const SearchKeywordMenu = ({
  teamSlug,
  query,
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (values) => {
    const fields = [];
    const team_tasks = [];
    const keyword_fields = {};

    values.forEach((v) => {
      if (parseInt(v, 10)) {
        team_tasks.push(v);
      } else {
        fields.push(v);
      }
    });

    if (fields.length) {
      keyword_fields.fields = fields;
    }
    if (team_tasks.length) {
      keyword_fields.team_tasks = team_tasks;
    }

    onChange({ keyword_fields });
    handleClose();
  };

  return (
    <React.Fragment>
      <SettingsIcon onClick={e => setAnchorEl(e.target)} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <SearchKeywordContainer
          teamSlug={teamSlug}
          query={query}
          onDismiss={handleClose}
          onSubmit={handleChange}
        />
      </Menu>
    </React.Fragment>
  );
};

SearchKeywordMenu.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchKeywordMenu;
