import React, { Component } from 'react';
import { CardHeader } from 'material-ui/Card';
import MappedMessage from '../MappedMessage';

class TimelineHeader extends Component {
  render() {
    return (
      <CardHeader {...this.props} title={<MappedMessage msgObj={this.props.msgObj} msgKey={this.props.msgKey} />} expandable className="media__notes-heading" />
    );
  }
}

export default TimelineHeader;
