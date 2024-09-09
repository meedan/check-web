import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Menu from '@material-ui/core/Menu';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExplainerForm from './ExplainerForm';
import ClaimFactCheckForm from './ClaimFactCheckForm';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import PublishedIcon from '../../icons/fact_check.svg';
import BookIcon from '../../icons/book.svg';
import styles from './NewArticleButton.module.css';

const NewArticleButtonWrapper = ({ children, disabled }) => {
  if (disabled) {
    return (
      <Tooltip
        arrow
        key="create-article-button"
        placement="top"
        title={
          <FormattedMessage
            defaultMessage="You can't add an article here."
            description="Tooltip message displayed on new article button when it is disabled."
            id="newArticleButton.tooltip"
          />
        }
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
  buttonMainProps,
  disabled,
  onCreate,
  projectMedia,
  team,
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
        buttonProps={{
          id: 'new-article-menu__open-button',
        }}
        disabled={disabled}
        iconLeft={<AddIcon />}
        label={
          <FormattedMessage
            defaultMessage="New Article"
            description="Label of a button that opens a form to create a new article."
            id="newArticleButton.newArticle"
          />
        }
        size="default"
        theme="lightBeige"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
        {...buttonMainProps}
      />
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        className={styles.menuList}
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className={styles.menuItem} disabled={Boolean(projectMedia?.claim_description?.id)} id="new-article-button__add-claim-and-fact-check" onClick={handleOpenFactCheck}>
          <ListItemIcon className={styles.itemIcon}>
            <PublishedIcon />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage
              defaultMessage="Claim & Fact-Check"
              description="The navigation name of the articles section"
              id="articlesComponent.claimAndFactCheck"
            />
          </ListItemText>
        </MenuItem>
        <MenuItem className={styles.menuItem} id="new-article-button__add-explainer" onClick={handleOpenExplainer}>
          <ListItemIcon className={styles.itemIcon}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage
              defaultMessage="Explainer"
              description="The navigation name of the articles section"
              id="articlesComponent.exaplainer"
            />
          </ListItemText>
        </MenuItem>
      </Menu>
      {openExplainer && <ExplainerForm article={{}} projectMedia={projectMedia} team={team} onClose={setOpenExplainer} onCreate={onCreate} />}
      {openFactCheck && <ClaimFactCheckForm article={{}} projectMedia={projectMedia} team={team} onClose={setOpenFactCheck} onCreate={onCreate} />}
    </NewArticleButtonWrapper>
  );
};

NewArticleButton.defaultProps = {
  buttonMainProps: {},
  disabled: false,
  projectMedia: null,
  onCreate: () => {},
};

NewArticleButton.propTypes = {
  buttonMainProps: PropTypes.object,
  disabled: PropTypes.bool,
  projectMedia: PropTypes.object,
  team: PropTypes.object.isRequired,
  onCreate: PropTypes.func,
};

export default createFragmentContainer(NewArticleButton, graphql`
  fragment NewArticleButton_team on Team {
    ...ClaimFactCheckForm_team
    ...ExplainerForm_team
  }
  fragment NewArticleButton_projectMedia on ProjectMedia {
    claim_description {
      id
    }
    ...ClaimFactCheckForm_projectMedia
    ...ExplainerForm_projectMedia
  }
`);
