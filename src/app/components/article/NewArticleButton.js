import React from 'react';
import Menu from '@material-ui/core/Menu';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import styles from './NewArticleButton.module.css';
import PublishedIcon from '../../icons/fact_check.svg';
import BookIcon from '../../icons/book.svg';

const NewArticleButton = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuItemClick = () => {};

  return (
    <React.Fragment>
      <ButtonMain
        variant="contained"
        size="default"
        theme="lightBeige"
        iconLeft={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label="New Article"
        buttonProps={{
          id: 'new-article-menu__open-button',
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
        <MenuItem onClick={handleMenuItemClick} className={styles.menuItem}>
          <ListItemIcon className={styles.itemIcon}>
            <PublishedIcon />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage
              id="articlesComponent.claimAndFactCheck"
              defaultMessage="Claim & Fact Check"
              description="The navigation name of the articles section"
            />
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuItemClick} className={styles.menuItem}>
          <ListItemIcon className={styles.itemIcon}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage
              id="articlesComponent.exaplainer"
              defaultMessage="Explainer"
              description="The navigation name of the articles section"
            />
          </ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default NewArticleButton;
