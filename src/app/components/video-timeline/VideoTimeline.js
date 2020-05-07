/* eslint-disable */
import React, { Component } from 'react';

import PlayerContainer from './PlayerContainerModern';
import TimelineContainer from './TimelineContainerModern';

const NOOP = () => {};

class VideoTimeline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: 0,
      playing: false,
      time: 0,
      progress: 0,
    };
  }

  render() {
    console.log({ props: this.props });

    const { params } = this.props;
    const {
      playing, duration, time, progress, seekTo, scrubTo,
    } = this.state;

    return (
      <div>
        <PlayerContainer
          {...{
            playing, duration, time, progress, seekTo, scrubTo, params,
          }}
          update={payload => this.setState(payload)}
        />
        <hr />
        <TimelineContainer {...{ time, duration, params }} />
      </div>
    );
  }
}

export default VideoTimeline;

