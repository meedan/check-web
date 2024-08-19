/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import { getStatus, bemClass } from '../../../helpers';
import ChatBubbleIcon from '../../../icons/chat_bubble.svg';
import ChatBubbleFilledIcon from '../../../icons/chat_bubble_filled.svg';
import ChevronDownIcon from '../../../icons/chevron_down.svg';
import EllipseIcon from '../../../icons/ellipse.svg';
import LockIcon from '../../../icons/lock.svg';
import styles from './RatingSelector.module.css';

const RatingSelector = ({
  disabled,
  onStatusChange,
  status,
  statuses,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const currentStatus = getStatus(statuses, status || statuses.default);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (clickedStatus) => {
    setAnchorEl(null);
    if (clickedStatus !== status) {
      onStatusChange(clickedStatus);
    }
  };

  return (
    <div className={styles['rating-wrapper']}>
      <ButtonMain
        className={styles['rating-button']}
        customStyle={{ borderColor: currentStatus?.style?.color }}
        disabled={disabled}
        variant="outlined"
        theme="text"
        size="default"
        onClick={e => setAnchorEl(e.currentTarget)}
        iconLeft={currentStatus.should_send_message ? <ChatBubbleFilledIcon style={{ color: currentStatus?.style?.color }} /> : <EllipseIcon style={{ color: currentStatus?.style?.color }} />}
        iconRight={!disabled ? <ChevronDownIcon /> : <LockIcon style={{ color: currentStatus?.style?.color }} />}
        label={currentStatus.label}
      />
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {statuses.statuses.map(statusItem => (
          <MenuItem
            key={statusItem.id}
            className={`${bemClass(
              'media-status__menu-item',
              currentStatus === statusItem.id,
              '--current',
            )} media-status__menu-item--${statusItem.id.replace('_', '-')}`}
            onClick={() => handleStatusClick(statusItem.id)}
          >
            <span className={styles['status-label']}>
              <EllipseIcon style={{ color: statusItem.style.color }} />
              {statusItem.should_send_message ? <ChatBubbleIcon /> : null}
              {statusItem.label}
            </span>
          </MenuItem>
        ))}
      </Popover>
    </div>
  );
};

RatingSelector.propTypes = {
  disabled: PropTypes.bool,
  onStatusChange: PropTypes.func.isRequired,
  status: PropTypes.string,
  statuses: PropTypes.object.isRequired,
};

RatingSelector.defaultProps = {
  disabled: false,
  status: 'undetermined',
};

export default RatingSelector;
