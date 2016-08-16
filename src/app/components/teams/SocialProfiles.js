import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
class SocialProfiles extends Component {
  render() {

    return (
      <div>
      <FlatButton label='Facebook'/>
      <FlatButton label='Twitter'/>
      <FlatButton label='Linked in'/>
      <FlatButton label='Whatsapp'/>
      <FlatButton label='Slack'/>
      <FlatButton label='Youtube'/>
      <FlatButton label='Skype'/>
      </div>
    );
  }
}

export default SocialProfiles;
