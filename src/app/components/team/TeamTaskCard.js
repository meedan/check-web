import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ArrowDropDownIcon from '../../icons/arrow_drop_down.svg';
import ExpandMoreIcon from '../../icons/expand_more.svg';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TeamTaskCardForm from './TeamTaskCardForm';

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
      mb={2}
      bgcolor="var(--brandBackground)"
      padding="16px"
      borderRadius="5px"
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
        <ButtonMain
          className="team-tasks__menu-item-button"
          onClick={e => setAnchorEl(e.currentTarget)}
          iconLeft={icon}
          size="default"
          variant="text"
          theme="text"
          iconRight={<ArrowDropDownIcon />}
          label={
            <FormattedMessage
              id="teamTaskCard.menu"
              defaultMessage="Field {number}"
              values={{ number: index }}
              description="E.g. Field 1, Field 2..."
            />
          }
        />
        <Box display="flex">
          <Box mr={4}>
            <SwitchComponent
              onChange={() => setRequired(!required)}
              checked={required}
              labelPlacement="end"
              label={<FormattedMessage
                id="teamTaskCard.required"
                defaultMessage="Required"
                description="Toggle switch to make field required"
              />}
            />
          </Box>
          <span>
            <SwitchComponent
              onChange={() => setShowInBrowserExtension(!showInBrowserExtension)}
              checked={showInBrowserExtension}
              labelPlacement="end"
              label={<FormattedMessage
                id="teamTaskCard.showInBrowserExtension"
                defaultMessage="Show in browser extension"
                description="Toggle switch to make field visible in the browser extension"
              />}
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
          <FormattedMessage
            id="global.edit"
            defaultMessage="Edit"
            description="Generic label for a button or link for a user to press when they wish to edit content or functionality"
          />
        </MenuItem>
        <MenuItem className="team-tasks__delete-button" onClick={handleMenuDelete}>
          <FormattedMessage
            id="global.delete"
            defaultMessage="Delete"
            description="Generic label for a button or link for a user to press when they wish to delete content or remove functionality"
          />
        </MenuItem>
      </Menu>
      <Divider />
      <Box display="flex" ml={1}>
        <ButtonMain
          iconCenter={<ExpandMoreIcon />}
          variant="text"
          theme="text"
          size="default"
          onClick={() => setExpanded(!expanded)}
        />
        <div className="typography-body1">
          <Box my={2} className="team-tasks__task-label">
            <Box fontWeight="500">
              {task.label}
            </Box>
            {task.description}
          </Box>
        </div>
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
