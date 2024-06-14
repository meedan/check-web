import React from 'react';
import PropTypes from 'prop-types';
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

const NewArticleButton = ({ team, buttonMainProps }) => {
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
        label={
          <FormattedMessage
            id="articlesComponent.newArticle"
            defaultMessage="New Article"
            description="Label of a button that opens a form to create a new article."
          />
        }
        buttonProps={{
          id: 'new-article-menu__open-button',
        }}
        {...buttonMainProps}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        getContentAnchorEl={null}
        onClose={() => setAnchorEl(null)}
        className={styles.menuList}
      >
        <MenuItem onClick={handleOpenFactCheck} className={styles.menuItem}>
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
        <MenuItem onClick={handleOpenExplainer} className={styles.menuItem}>
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

NewArticleButton.defaultProps = {
  buttonMainProps: {},
};

NewArticleButton.propTypes = {
  team: PropTypes.object.isRequired,
  buttonMainProps: PropTypes.object,
};

export default NewArticleButton;
