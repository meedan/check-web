import React from 'react';
import { CardHeader } from 'material-ui/Card';
import MappedMessage from '../MappedMessage';

const TimelineHeader = props => (
  <CardHeader title={<MappedMessage msgObj={props.msgObj} msgKey={props.msgKey} />} expandable className="media__notes-heading" />);

export default TimelineHeader;
