import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import BoltIcon from '../../icons/bolt.svg';
import styles from './FeedTopBar.module.css';

const QuickFilterMenu = ({
  setTeamFilters,
  currentOrg,
  teamsWithoutCurrentOrg,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelectCurrentOrg = () => {
    setAnchorEl(null);
    setTeamFilters([currentOrg.dbid]);
  };

  const handleSelectNotCurrentOrg = () => {
    setAnchorEl(null);
    setTeamFilters(teamsWithoutCurrentOrg.map(org => org.node.dbid));
  };

  return (
    <div className="quick-filter-menu">
      <ButtonMain
        variant="contained"
        size="small"
        theme="text"
        iconLeft={<BoltIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label={
          <FormattedMessage
            id="quickFilterMenu.filters"
            defaultMessage="Filters"
            description="Label for button that opens a menu with options for filtering a search"
          />
        }
        className="int-quick-filter-menu__button--open"
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ListSubheader>
          <span className={cx('typography-body1-bold', [styles.quickFilterHeader])}>
            <FormattedMessage
              id="quickFilterMenu.header"
              defaultMessage="Quick Filters"
              description="Header for a menu containing shortcuts to various search filters"
            />
          </span>
        </ListSubheader>
        <MenuItem
          className="int-quick-filter-menu__menu-item--other-workspaces"
          onClick={handleSelectNotCurrentOrg}
        >
          <ListItemIcon className={styles.itemIcon}>
            <BoltIcon />
          </ListItemIcon>
          <FormattedHTMLMessage
            id="quickFilterMenu.otherWorkspaces"
            defaultMessage="Items <strong>not</strong> in my workspace"
            description="Label for a menu item that filters a search of items so that the user only sees those that are *not* in their workspace"
          />
        </MenuItem>
        <MenuItem
          className="int-quick-filter-menu__menu-item--my-workspace"
          onClick={handleSelectCurrentOrg}
        >
          <ListItemIcon className={styles.itemIcon}>
            <BoltIcon />
          </ListItemIcon>
          <FormattedHTMLMessage
            id="quickFilterMenu.myWorkspace"
            defaultMessage="Items <strong>only</strong> in my workspace"
            description="Label for a menu item that filters a search of items so that the user only sees those that are in their workspace"
          />
        </MenuItem>
      </Menu>
    </div>
  );
};

QuickFilterMenu.defaultProps = {
};

QuickFilterMenu.propTypes = {
  setTeamFilters: PropTypes.func.isRequired,
  currentOrg: PropTypes.object.isRequired,
  teamsWithoutCurrentOrg: PropTypes.array.isRequired,
};

export default QuickFilterMenu;
