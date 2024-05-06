import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ArrowDropDownIcon from '../../icons/arrow_drop_down.svg';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TeamTaskCardForm from './TeamTaskCardForm';
import settingsStyles from './Settings.module.css';
import styles from './Tasks.module.css';

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

  const handleMenuEdit = () => {
    setAnchorEl(null);
    onEdit();
  };

  const handleMenuDelete = () => {
    setAnchorEl(null);
    onDelete();
  };

  return (
    <div className={cx(styles['task-card'], settingsStyles['setting-content-container-inner'])}>
      <div className={styles['task-card-header']}>
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
        <div className={styles['task-card-header-actions']}>
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
        </div>
      </div>
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
      <div className={settingsStyles['setting-content-container-inner-accent']}>
        <div className={cx('team-tasks__task-label', styles['task-card-label'])}>
          <strong>
            {task.label}
          </strong>
          {task.description}
        </div>
        <TeamTaskCardForm task={task} about={about} />
      </div>
      <div>
        {children}
      </div>
    </div>
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
