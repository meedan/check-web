import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';

const AddFilterMenu = ({ onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelect = (field) => {
    setAnchorEl(null);
    onSelect(field);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" startIcon={<AddIcon />} onClick={e => setAnchorEl(e.currentTarget)}>
        <FormattedMessage id="addFilterMenu.addFilter" defaultMessage="Add filter" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleSelect('range')}>Time range</MenuItem>
        <MenuItem onClick={() => handleSelect('tags')}>Tags</MenuItem>
        <MenuItem onClick={() => handleSelect('show')}>Media type</MenuItem>
        <MenuItem onClick={() => handleSelect('verification_status')}>Item status</MenuItem>
        <MenuItem onClick={() => handleSelect('users')}>Created by</MenuItem>
        <MenuItem onClick={() => handleSelect('language')}>Language</MenuItem>
        <MenuItem onClick={() => handleSelect('assigned_to')}>Assigned to</MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default AddFilterMenu;
