/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TeamTaskCardForm from './TeamTaskCardForm';
import globalStrings from '../../globalStrings';


const TeamTaskCard = ({
  about,
  children,
  icon,
  index,
  task,
  onEdit,
  onDelete,
  showInBrowserExtension,
  setShowInBrowserExtension,
  required,
  setRequired,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [expanded, setExpanded] = React.useState(true);

  const handleMenuEdit = () => {
    setAnchorEl(null);
    onEdit();
  };

  const handleMenuDelete = () => {
    setAnchorEl(null);
    onDelete();
  };

  return (
    <Box
      my={2}
      mr={2}
      bgcolor="#f6f6f6"
      border="2px solid #ced3e2"
      borderRadius="10px"
      minHeight="100px"
      width="100%"
    >
      <Box
        px={2}
        py={1}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          className="team-tasks__menu-item-button"
          onClick={e => setAnchorEl(e.currentTarget)}
          startIcon={icon}
          endIcon={<ArrowDropDownIcon />}
        >
          <FormattedMessage
            id="teamTaskCard.menu"
            defaultMessage="Field {number}"
            values={{ number: index }}
            description="E.g. Field 1, Field 2..."
          />
        </Button>
        <Box display="flex">
          <Box mr={4}>
            <Switch
              onClick={() => setRequired(!required)}
              checked={required}
            />
            <FormattedMessage
              id="teamTaskCard.required"
              defaultMessage="Required"
              description="Toggle switch to make field required"
            />
          </Box>
          <span>
            <Switch
              onClick={() => setShowInBrowserExtension(!showInBrowserExtension)}
              checked={showInBrowserExtension}
            />
            <FormattedMessage
              id="teamTaskCard.showInBrowserExtension"
              defaultMessage="Show in browser extension"
              description="Toggle switch to make field visible in the browser extension"
            />
          </span>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="team-tasks__edit-button" onClick={handleMenuEdit}>
          <FormattedMessage {...globalStrings.edit} />
        </MenuItem>
        <MenuItem className="team-tasks__delete-button" onClick={handleMenuDelete}>
          <FormattedMessage {...globalStrings.delete} />
        </MenuItem>
      </Menu>
      <Divider />
      <Box display="flex" ml={1}>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandMoreIcon />
        </IconButton>
        <Typography variant="body1">
          <Box my={2} className="team-tasks__task-label">
            <Box fontWeight="500">
              {task.label}
            </Box>
            {task.description}
          </Box>
        </Typography>
      </Box>
      <Collapse in={expanded}>
        <TeamTaskCardForm task={task} about={about} />
      </Collapse>
      <Divider />
      <Box px={2} py={1}>
        {children}
      </Box>
    </Box>
  );
};

TeamTaskCard.propTypes = {
  icon: PropTypes.node.isRequired,
  task: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showInBrowserExtension: PropTypes.bool.isRequired,
  setShowInBrowserExtension: PropTypes.func.isRequired,
  required: PropTypes.bool.isRequired,
  setRequired: PropTypes.func.isRequired,
  about: PropTypes.object.isRequired,
};

export default TeamTaskCard;
