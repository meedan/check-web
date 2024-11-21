import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import TeamAvatar from '../../team/TeamAvatar';
import TextField from '../inputs/TextField';
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
            [styles.tabletWidth]: fullWidth,
            [styles.phoneWidth]: !fullWidth,
          })
      }
    >
      <div className={styles.deviceTop}>
        <div />
        <div className={styles.deviceTopDecorationPill}>
          <div className={styles.deviceTopDecorationCircle} />
        </div>
        <ButtonMain
          iconCenter={<DevicesIcon />}
          size="large"
          theme="text"
          variant="text"
          onClick={handleClick}
        />
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
          theme="text"
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
// The component should accept the following props:
//   contactAvatar: string, url to the tipline logo
//   contactId: string, whatsapp number or similar platform id
//   screenContent : node, a div with the actual chat history contents
//   onSendText : function, called when a text is entered in the component’s text input
