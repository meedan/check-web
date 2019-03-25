import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import IconDeadline from 'material-ui/svg-icons/image/timer';
import TimeBefore from '../TimeBefore';
import {
  Row,
  black38,
  unstartedRed,
  units,
  Offset,
} from '../../styles/js/shared';

const messages = defineMessages({
  deadline: {
    id: 'itemDeadline.title',
    defaultMessage: 'Deadline',
  },
});

const ItemDeadline = (props) => {
  const { media, isRtl } = props;
  let deadlineSoon = false;
  let deadline = null;
  if (media.last_status_obj && media.last_status_obj.content) {
    const now = new Date().getTime() / 1000;
    const content = JSON.parse(media.last_status_obj.content);
    content.forEach((field) => {
      if (field.field_name === 'deadline') {
        deadline = parseInt(field.value, 10);
      }
    });
    const hoursLeft = (deadline - now) / 3600;
    deadlineSoon = hoursLeft < 0.1 * media.team.get_status_target_turnaround;
  }

  return (
    deadline ?
      <Row
        style={{ color: deadlineSoon ? unstartedRed : black38 }}
        title={props.intl.formatMessage(messages.deadline)}
      >
        <IconDeadline
          style={{
            color: deadlineSoon ? unstartedRed : black38,
            height: units(2),
            width: units(2),
          }}
        />
        <Offset isRtl={isRtl}>
          <TimeBefore
            date={new Date(deadline * 1000)}
            titlePrefix={props.intl.formatMessage(messages.deadline)}
          />
        </Offset>
      </Row>
      : null
  );
};

export default injectIntl(ItemDeadline);
