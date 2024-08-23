/* eslint-disable react/sort-prop-types */
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
  currentOrg,
  setTeamFilters,
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
        className="int-quick-filter-menu__button--open"
        iconLeft={<BoltIcon />}
        label={
          <FormattedMessage
            defaultMessage="Filters"
            description="Label for button that opens a menu with options for filtering a search"
            id="quickFilterMenu.filters"
          />
        }
        size="small"
        theme="text"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ListSubheader>
          <span className={cx('typography-body1-bold', [styles.quickFilterHeader])}>
            <FormattedMessage
              defaultMessage="Quick Filters"
              description="Header for a menu containing shortcuts to various search filters"
              id="quickFilterMenu.header"
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
            defaultMessage="Items <strong>not</strong> in my workspace"
            description="Label for a menu item that filters a search of items so that the user only sees those that are *not* in their workspace"
            id="quickFilterMenu.otherWorkspaces"
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
            defaultMessage="Items <strong>only</strong> in my workspace"
            description="Label for a menu item that filters a search of items so that the user only sees those that are in their workspace"
            id="quickFilterMenu.myWorkspace"
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
