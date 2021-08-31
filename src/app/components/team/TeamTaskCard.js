import React from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const TeamTaskCard = ({
  children,
  icon,
  task,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

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
      margin={2}
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
          onClick={e => setAnchorEl(e.currentTarget)}
          startIcon={icon}
          endIcon={<ArrowDropDownIcon />}
        >
          <FormattedMessage
            id="teamTaskCard.menu"
            defaultMessage="Field #"
            description="E.g. Field 1, Field 2..."
          />
        </Button>
        <span>
          <FormattedMessage
            id="teamTaskCard.required"
            defaultMessage="Required"
            description="Toggle switch to make field required"
          />
          <Switch />
        </span>
        <span>
          <FormattedMessage
            id="teamTaskCard.showInBrowserExtension"
            defaultMessage="Show in browser extension"
            description="Toggle switch to make field visible in the browser extension"
          />
          <Switch />
        </span>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem className="team-tasks__edit-button" onClick={handleMenuEdit}>
          <FormattedMessage id="teamTasks.edit" defaultMessage="Edit" />
        </MenuItem>
        <MenuItem className="team-tasks__delete-button" onClick={handleMenuDelete}>
          <FormattedMessage id="teamTasks.delete" defaultMessage="Delete" />
        </MenuItem>
      </Menu>
      <Divider />
      <Typography variant="body1">
        <Box p={2} fontWeight="500">
          {task.label}
        </Box>
      </Typography>
      <Divider />
      <Box px={2} py={1}>
        {children}
      </Box>
    </Box>
  );
};

export default TeamTaskCard;
