import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
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
  menu: {
    outline: 0,
  },
  divider: {
    marginBottom: theme.spacing(1),
    backgroundColor: opaqueBlack54,
  },
}));

const SmoochBotSidebar = ({ currentOption, resources, onClick }) => {
  const classes = useStyles();

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
      {label}
    </MenuItem>
  );

  return (
    <MenuList className={classes.menu}>
      { Object.keys(labels).map((key) => {
        const label = labels[key];
        return <Option key={key} id={key} label={label} />;
      })}
      <Divider className={classes.divider} />
      { resources.map((resource, index) => {
        const label = resource.smooch_custom_resource_title;
        return (
          <Option
            key={resource.smooch_custom_resource_id}
            id={`resource_${index}`}
            label={label}
          />
        );
      })}
    </MenuList>
  );
};

SmoochBotSidebar.defaultProps = {
  resources: [],
};

SmoochBotSidebar.propTypes = {
  currentOption: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
