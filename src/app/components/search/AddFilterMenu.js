import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DescriptionIcon from '@material-ui/icons/Description';
import FolderIcon from '@material-ui/icons/Folder';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import StarIcon from '@material-ui/icons/Star';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';

const StyledButton = withStyles({
  root: {
    height: '36px',
  },
  text: {
    textTransform: 'none',
  },
})(Button);

const AddFilterMenu = ({
  addedFields,
  hideOptions,
  onSelect,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelect = (field) => {
    setAnchorEl(null);
    onSelect(field);
  };

  const options = [{
    id: 'add-filter-menu__folder',
    key: 'projects',
    icon: <FolderIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.folder"
        defaultMessage="Folder"
        description="Menu option to enable searching items by folder"
      />
    ),
  },
  {
    id: 'add-filter-menu__project-group-id',
    key: 'project_group_id',
    icon: <FolderSpecialIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.collection"
        defaultMessage="Collection"
        description="Menu option to enable searching items by collection"
      />
    ),
  },
  {
    id: 'add-filter-menu__time-range',
    key: 'range',
    icon: <DateRangeIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.timeRange"
        defaultMessage="Date range"
        description="Menu option to enable searching items by date range"
      />
    ),
  },
  {
    id: 'add-filter-menu__tags',
    key: 'tags',
    icon: <LocalOfferIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.tag"
        defaultMessage="Tag"
        description="Menu option to enable searching items by tags"
      />
    ),
  },
  {
    id: 'add-filter-menu__media-type',
    key: 'show',
    icon: <DescriptionIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.mediaType"
        defaultMessage="Media type"
        description="Menu option to enable searching items by media type"
      />
    ),
  },
  {
    id: 'add-filter-menu__status',
    key: 'verification_status',
    icon: <LabelIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.itemStatus"
        defaultMessage="Item status"
        description="Menu option to enable searching items by item status"
      />
    ),
  },
  {
    id: 'add-filter-menu__report-status',
    key: 'report_status',
    icon: <ReportIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.reportStatus"
        defaultMessage="Report status"
        description="Menu option to enable searching items by report status"
      />
    ),
  },
  {
    id: 'add-filter-menu__created-by',
    key: 'users',
    icon: <PersonIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.createdBy"
        defaultMessage="Created by"
        description="Menu option to enable searching items by author"
      />
    ),
  },
  {
    id: 'add-filter-menu__language',
    key: 'dynamic',
    icon: <LanguageIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.language"
        defaultMessage="Language"
        description="Menu option to enable searching items by language"
      />
    ),
  },
  {
    id: 'add-filter-menu__time-assigned-to',
    key: 'assigned_to',
    icon: <PersonIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.assignedTo"
        defaultMessage="Assignment"
        description="Menu option to enable searching items by assigned users"
      />
    ),
  },
  {
    id: 'add-filter-menu__team-tasks',
    key: 'team_tasks',
    icon: <StarIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.metadata"
        defaultMessage="Metadata"
        description="Menu option to enable searching items by metadata fields"
      />
    ),
  }];

  return (
    <React.Fragment>
      <StyledButton
        id="add-filter-menu__open-button"
        startIcon={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        size="small"
      >
        <FormattedMessage
          id="addFilterMenu.addFilter"
          defaultMessage="Add filter"
          description="Button that opens menu with filter field options"
        />
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <FormattedMessage
            id="addFilterMenu.filterBy"
            defaultMessage="Filter by"
            description="Header to menu of filter field types"
          />
        </MenuItem>
        { options.map(o => hideOptions.includes(o.key) ? null : (
          <MenuItem
            id={o.id}
            key={o.key}
            onClick={() => handleSelect(o.key)}
            disabled={(
              addedFields.includes(o.key) ||
              (addedFields.includes('projects') && o.key === 'project_group_id') ||
              (addedFields.includes('project_group_id') && o.key === 'projects')
            )}
          >
            <ListItemIcon>
              {o.icon}
            </ListItemIcon>
            {o.label}
          </MenuItem>
        )) }
      </Menu>
    </React.Fragment>
  );
};

AddFilterMenu.defaultProps = {
  addedFields: [],
  hideOptions: [],
};

AddFilterMenu.propTypes = {
  addedFields: PropTypes.arrayOf(PropTypes.string),
  hideOptions: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func.isRequired,
};

export default AddFilterMenu;
