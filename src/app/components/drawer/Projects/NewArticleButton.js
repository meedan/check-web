import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../../icons/add.svg';

const NewArticleButton = ({ options, onMenuItemClick }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <React.Fragment>
      <ButtonMain
        variant="contained"
        size="default"
        theme="text"
        iconLeft={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label="New Article"
        buttonProps={{
          id: 'add-filter-menu__open-button',
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {options.map(o => (
          <MenuItem
            key={o.label}
            onClick={onMenuItemClick}
          >
            <ListItemIcon>
              {o.icon}
            </ListItemIcon>
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

export default NewArticleButton;
