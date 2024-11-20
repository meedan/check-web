import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import TeamAvatar from '../../team/TeamAvatar';
import TextField from '../inputs/TextField';
import AddIcon from '../../../icons/add.svg';
import DevicesIcon from '../../../icons/devices.svg';

const DeviceMockupComponent = ({
  chatFeedContent,
  contactAvatar,
  contactId,
}) => (
  <div className="Phone">
    <div className="PhoneTop">
      <div className="PhoneTopDecoration" />
      {/* FIX ICON */}
      <ButtonMain
        iconCenter={<DevicesIcon />}
        size="large"
        theme="text"
        variant="text"
      />
    </div>
    <div className="PhoneIdentifier">
      <TeamAvatar size="36px" team={{ avatar: contactAvatar }} />
      <div className="contactId">{ contactId }</div>
    </div>
    <div className="PhoneChatFeed">
      { chatFeedContent }
    </div>
    <div className="PhoneInput">
      <ButtonMain
        iconCenter={<AddIcon />}
        size="large"
        theme="text"
        variant="text"
      />
      <TextField
        className="PhoneInputTextField"
      />
    </div>
    <div className="PhoneHome">
      <div className="PhoneHomeDecoration" />
    </div>
  </div>
);

DeviceMockupComponent.defaultProps = {
  contactAvatar: null,
  contactId: null,
  chatFeedContent: null,
};

DeviceMockupComponent.propTypes = {
  chatFeedContent: PropTypes.node,
  contactAvatar: PropTypes.string,
  contactId: PropTypes.string,
};

export default DeviceMockupComponent;
// The component should accept the following props:
//   contactAvatar: string, url to the tipline logo
//   contactId: string, whatsapp number or similar platform id
//   screenContent : node, a div with the actual chat history contents
//   onSendText : function, called when a text is entered in the component’s text input
