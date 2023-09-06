import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import { labels, labelsV2 } from './localizables';

const useStyles = makeStyles(theme => ({
  selected: {
    borderColor: 'var(--brandMain)',
    color: 'var(--brandMain)',
  },
  notSelected: {
    borderColor: 'var(--textSecondary)',
    color: 'var(--textSecondary)',
  },
  root: {
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    marginBottom: theme.spacing(1),
  },
  label: {
    width: 170,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menu: {
    outline: 0,
  },
  divider: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: 'var(--brandMain)',
  },
}));

const SmoochBotSidebar = ({
  currentOption,
  resources,
  version,
  onClick,
}) => {
  const classes = useStyles();

  const menuOptions = version === 'v2' ? labelsV2 : labels;

  const handleClick = (option) => {
    onClick(option);
  };

  const Option = ({ id, label }) => (
    <MenuItem
      key={id}
      onClick={() => { handleClick(id); }}
      className={clsx(classes.root, currentOption === id ?
        classes.selected : classes.notSelected)}
    >
      <div className={classes.label}>
        {label}
      </div>
    </MenuItem>
  );

  return (
    <MenuList className={classes.menu}>

      {/* Menu options */}
      { Object.keys(menuOptions).map((key) => {
        const label = menuOptions[key];
        return <Option key={key} id={key} label={label} />;
      })}

      {/* Resources */}
      <Divider className={classes.divider} />
      { resources.sort((a, b) => a.title.localeCompare(b.title)).map((resource) => {
        const label = resource.title;
        return (
          <Option
            key={resource.uuid}
            id={`resource_${resource.dbid}`}
            label={label}
          />
        );
      })}
    </MenuList>
  );
};

SmoochBotSidebar.defaultProps = {
  resources: [],
  version: 'v2',
};

SmoochBotSidebar.propTypes = {
  currentOption: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  version: PropTypes.oneOf(['v1', 'v2']),
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
