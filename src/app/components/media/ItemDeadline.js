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
  let deadlineSoon = null;

  if (media.deadline) {
    const now = new Date().getTime() / 1000;
    const deadline = parseInt(media.deadline, 10);
    const hoursLeft = (deadline - now) / 3600;
    deadlineSoon = hoursLeft < 0.1 * media.team.get_status_target_turnaround;
  }

  return (
    media.deadline ?
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
          <TimeBefore date={new Date(parseInt(media.deadline, 10) * 1000)} />
        </Offset>
      </Row>
      : null
  );
};

export default injectIntl(ItemDeadline);
