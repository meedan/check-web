import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../../icons/add.svg';
import styles from './NewArticleButton.module.css';

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
          id: 'new-article-menu__open-button',
        }}
        customStyle={{
          color: 'var(--color-gray-15)',
          backgroundColor: 'var(--color-gray-88)',
          borderColor: 'var(--color-gray-88)',
          borderRadius: '8px',
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        getContentAnchorEl={null}
        onClose={() => setAnchorEl(null)}
        className={styles.menuList}
      >
        {options.map(o => (
          <MenuItem
            key={o.label}
            onClick={onMenuItemClick}
            className={styles.menuItem}
          >
            <ListItemIcon className={styles.itemIcon}>
              {o.icon}
            </ListItemIcon>
            <ListItemText>
              {o.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

export default NewArticleButton;
