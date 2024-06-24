import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import { getStatus, bemClass } from '../../../helpers';
import ChatBubbleIcon from '../../../icons/chat_bubble.svg';
import ChatBubbleFilledIcon from '../../../icons/chat_bubble_filled.svg';
import ChevronDownIcon from '../../../icons/chevron_down.svg';
import EllipseIcon from '../../../icons/ellipse.svg';
import styles from '../../media/media.module.css';

const RatingSelector = ({
  status,
  statuses,
  onStatusChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const currentStatus = getStatus(statuses, status);
  console.log(status, currentStatus, statuses) //eslint-disable-line
  const currentStatusToClass = () => {
    if (status === '') return '';
    return `media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (clickedStatus) => {
    setAnchorEl(null);
    console.log(clickedStatus) //eslint-disable-line
    if (clickedStatus !== status) {
      onStatusChange(clickedStatus);
    }
  };

  return (
    <div className={cx('media-status', styles['media-status-wrapper'])}>
      <ButtonMain
        className={`media-status__label media-status__current ${currentStatusToClass(currentStatus)}`}
        customStyle={{ borderColor: currentStatus?.style?.color }}
        variant="outlined"
        theme="text"
        size="default"
        onClick={e => setAnchorEl(e.currentTarget)}
        iconLeft={currentStatus.should_send_message ? <ChatBubbleFilledIcon style={{ color: currentStatus?.style?.color }} /> : <EllipseIcon style={{ color: currentStatus?.style?.color }} />}
        iconRight={<ChevronDownIcon />}
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
  onStatusChange: PropTypes.func.isRequired,
  status: PropTypes.string,
  statuses: PropTypes.object.isRequired,
};

RatingSelector.defaultProps = {
  status: 'undetermined',
};

export default RatingSelector;
