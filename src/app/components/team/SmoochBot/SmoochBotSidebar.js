import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { labels } from './localizables';
import { checkBlue, opaqueBlack54 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  selected: {
    borderColor: checkBlue,
    color: checkBlue,
  },
  notSelected: {
    borderColor: opaqueBlack54,
    color: opaqueBlack54,
  },
  root: {
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    marginBottom: theme.spacing(1),
  },
}));

const SmoochBotSidebar = (props) => {
  const classes = useStyles();

  const handleClick = (option) => {
    props.onClick(option);
  };

  return (
    <MenuList>
      { Object.keys(labels).map((key) => {
        const label = labels[key];
        return (
          <MenuItem
            key={key}
            onClick={() => { handleClick(key); }}
            className={clsx(classes.root, props.currentOption === key ?
              classes.selected : classes.notSelected)}
          >
            {label}
          </MenuItem>
        );
      })}
    </MenuList>
  );
};

SmoochBotSidebar.propTypes = {
  currentOption: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
