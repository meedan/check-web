import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DescriptionIcon from '@material-ui/icons/Description';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import StarIcon from '@material-ui/icons/Star';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const AddFilterMenu = ({ onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelect = (field) => {
    setAnchorEl(null);
    onSelect(field);
  };

  return (
    <React.Fragment>
      <Button startIcon={<AddCircleOutlineIcon />} onClick={e => setAnchorEl(e.currentTarget)}>
        <FormattedMessage id="addFilterMenu.addFilter" defaultMessage="Add filter" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSelect('range')}>
          <ListItemIcon>
            <DateRangeIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.timeRange"
            defaultMessage="Time range"
            description="Menu option to enable searching items by time range"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('tags')}>
          <ListItemIcon>
            <LocalOfferIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.tags"
            defaultMessage="Tags"
            description="Menu option to enable searching items by tags"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('show')}>
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.itemType"
            defaultMessage="Media type"
            description="Menu option to enable searching items by media type"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('verification_status')}>
          <ListItemIcon>
            <LabelIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.itemStatus"
            defaultMessage="Item status"
            description="Menu option to enable searching items by item status"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('users')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.createdBy"
            defaultMessage="Created by"
            description="Menu option to enable searching items by author"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('dynamic')}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.language"
            defaultMessage="Language"
            description="Menu option to enable searching items by language"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('assigned_to')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.assignedTo"
            defaultMessage="Assigned to"
            description="Menu option to enable searching items by assigned users"
          />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('team_tasks')}>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <FormattedMessage
            id="addFilterMenu.customFields"
            defaultMessage="Custom fields"
            description="Menu option to enable searching items by custom fields"
          />
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default AddFilterMenu;
