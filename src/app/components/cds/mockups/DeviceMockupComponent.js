import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import TeamAvatar from '../../team/TeamAvatar';
import TextField from '../inputs/TextField';
import Tooltip from '../alerts-and-prompts/Tooltip';
import AddIcon from '../../../icons/add.svg';
import DevicesIcon from '../../../icons/devices.svg';
import styles from './DeviceMockupComponent.module.css';

const DeviceMockupComponent = ({
  children,
  contactAvatar,
  contactId,
  onSendText,
}) => {
  const [textValue, setTextValue] = React.useState('');
  const [fullWidth, setFullWidth] = React.useState(false);
  const handleClick = () => setFullWidth(!fullWidth);

  return (
    <div
      className={
        cx(styles.device,
          {
            [styles.tablet]: fullWidth,
            [styles.phone]: !fullWidth,
          })
      }
    >
      <div className={styles.deviceTop}>
        <div style={{ width: '30px' }} />
        <div className={styles.deviceTopDecorationPill}>
          <div className={styles.deviceTopDecorationCircle} />
        </div>
        <Tooltip
          arrow
          title={
            <FormattedMessage
              defaultMessage="Toggle Device Preview Width"
              description="Tooltip describing that you can change the width of the preview from phone to tablet"
              id="deviceMockup.devicesTooltip"
            />
          }
        >
          <span>
            <ButtonMain
              iconCenter={<DevicesIcon />}
              size="default"
              theme="beige"
              variant="text"
              onClick={handleClick}
            />
          </span>
        </Tooltip>
      </div>
      <div className={styles.deviceIdentifier}>
        <TeamAvatar size="36px" team={{ avatar: contactAvatar }} />
        <div className="contactId">{ contactId }</div>
      </div>
      <div className={styles.deviceChatFeed}>
        { children }
      </div>
      <div className={styles.deviceInput}>
        <ButtonMain
          iconCenter={<AddIcon />}
          size="large"
          theme="beige"
          variant="text"
        />
        <TextField
          className={styles.deviceInputTextField}
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendText(e.target.value);
              setTextValue('');
            }
          }}
        />
      </div>
      <div className={styles.deviceHome}>
        <div className={styles.deviceHomeDecoration} />
      </div>
    </div>
  );
};

DeviceMockupComponent.defaultProps = {
  contactAvatar: null,
  contactId: null,
  children: null,
};

DeviceMockupComponent.propTypes = {
  children: PropTypes.node,
  contactAvatar: PropTypes.string,
  contactId: PropTypes.string,
};

export default DeviceMockupComponent;
