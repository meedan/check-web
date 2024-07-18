import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Menu from '@material-ui/core/Menu';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import styles from './NewArticleButton.module.css';
import PublishedIcon from '../../icons/fact_check.svg';
import BookIcon from '../../icons/book.svg';
import ExplainerForm from './ExplainerForm';
import ClaimFactCheckForm from './ClaimFactCheckForm';

const NewArticleButtonWrapper = ({ disabled, children }) => {
  if (disabled) {
    return (
      <Tooltip
        key="create-article-button"
        placement="top"
        title={
          <FormattedMessage
            id="newArticleButton.tooltip"
            defaultMessage="You can't add an article here."
            description="Tooltip message displayed on new article button when it is disabled."
          />
        }
        arrow
      >
        <div className="new-article-button__tooltip-children">
          {children}
        </div>
      </Tooltip>
    );
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

const NewArticleButton = ({
  team,
  projectMedia,
  disabled,
  buttonMainProps,
}) => {
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
    <NewArticleButtonWrapper disabled={disabled}>
      <ButtonMain
        variant="contained"
        size="default"
        theme="lightBeige"
        iconLeft={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label={
          <FormattedMessage
            id="newArticleButton.newArticle"
            defaultMessage="New Article"
            description="Label of a button that opens a form to create a new article."
          />
        }
        disabled={disabled}
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
        <MenuItem onClick={handleOpenFactCheck} className={styles.menuItem} disabled={Boolean(projectMedia?.claim_description?.id)} id="new-article-button__add-claim-and-fact-check">
          <ListItemIcon className={styles.itemIcon}>
            <PublishedIcon />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage
              id="articlesComponent.claimAndFactCheck"
              defaultMessage="Claim & Fact-Check"
              description="The navigation name of the articles section"
            />
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenExplainer} className={styles.menuItem} id="new-article-button__add-explainer">
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
      {openExplainer && <ExplainerForm team={team} projectMedia={projectMedia} onClose={setOpenExplainer} />}
      {openFactCheck && <ClaimFactCheckForm team={team} projectMedia={projectMedia} onClose={setOpenFactCheck} />}
    </NewArticleButtonWrapper>
  );
};

NewArticleButton.defaultProps = {
  disabled: false,
  buttonMainProps: {},
  projectMedia: null,
};

NewArticleButton.propTypes = {
  team: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  buttonMainProps: PropTypes.object,
  projectMedia: PropTypes.object,
};

export default createFragmentContainer(NewArticleButton, graphql`
  fragment NewArticleButton_projectMedia on ProjectMedia {
    claim_description {
      id
    }
    ...ClaimFactCheckForm_projectMedia
    ...ExplainerForm_projectMedia
  }
`);
