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
import ExplainerForm from './ExplainerForm';
import ClaimFactCheckForm from './ClaimFactCheckForm';

const NewArticleButton = (team) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openExplainer, setOpenExplainer] = React.useState(false);
  const [openFactCheck, setOpenFactCheck] = React.useState(false);

  const handleOpenExplainer = () => {
    setOpenFactCheck(false);
    setOpenExplainer(true);
    setAnchorEl(null);
  };

  const handleOpenFactCheck = () => {
    setOpenFactCheck(true);
    setOpenExplainer(false);
    setAnchorEl(null);
  };

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
        <MenuItem onClick={() => handleOpenFactCheck()} className={styles.menuItem}>
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
        <MenuItem onClick={() => handleOpenExplainer(true)} className={styles.menuItem}>
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
      {openExplainer && <ExplainerForm team={team} onClose={setOpenExplainer} />}
      {openFactCheck && <ClaimFactCheckForm team={team} onClose={setOpenFactCheck} />}
    </React.Fragment>
  );
};

export default NewArticleButton;
