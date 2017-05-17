import React, { Component, PropTypes } from 'react';
import { defineMessages } from 'react-intl';
import MappedMessage from '../MappedMessage';
import MdInfoOutline from 'react-icons/lib/md/info-outline';
import Tooltip from 'rc-tooltip';
import config from 'config';

class TimelineHeader extends Component {
  render() {
    return config.appName === 'check' ? (
      <Tooltip placement="bottom" trigger={['click']} overlay={<MediaChecklist/>} overlayClassName="">
        <h3 className="media__notes-heading">
          <MappedMessage msgObj={this.props.msgObj} msgKey={this.props.msgKey} />
          <MdInfoOutline/>
        </h3>
      </Tooltip>
    ) : (
      <h3 className="media__notes-heading">
        <MappedMessage msgObj={this.props.msgObj} msgKey={this.props.msgKey} />
      </h3>
    );
  }
}

export default TimelineHeader;
