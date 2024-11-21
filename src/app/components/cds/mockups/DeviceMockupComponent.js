import React from 'react';
import PropTypes from 'prop-types';
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
}) => {
  const onSendText = (e) => {
  // eslint-disable-next-line
    console.log(e);
    // send to child?
    // clear text field
  };

  return (
    <div className={styles.phone}>
      <div className={styles.phoneTop}>
        <div />
        <div className={styles.phoneTopDecorationPill}>
          <div className={styles.phoneTopDecorationCircle} />
        </div>
        <ButtonMain
          iconCenter={<DevicesIcon />}
          size="large"
          theme="text"
          variant="text"
        />
      </div>
      <div className={styles.phoneIdentifier}>
        <TeamAvatar size="36px" team={{ avatar: contactAvatar }} />
        <div className="contactId">{ contactId }</div>
      </div>
      <div className={styles.phoneChatFeed}>
        { children }
      </div>
      <div className={styles.phoneInput}>
        <ButtonMain
          iconCenter={<AddIcon />}
          size="large"
          theme="text"
          variant="text"
        />
        <TextField
          className={styles.phoneInputTextField}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendText(e.target.value);
            }
          }}
        />
      </div>
      <div className={styles.phoneHome}>
        <div className={styles.phoneHomeDecoration} />
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
