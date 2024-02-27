import React, { Component } from 'react';
import KeepBot from './KeepBot';
import TaggerBot from './TaggerBot';

class TeamBot extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let botContent = null;
    switch (this.props.bot.identifier) {
    case 'keep':
      botContent = (
        <KeepBot {...this.props} />
      );
      break;
    case 'tagger':
      botContent = (
        <TaggerBot {...this.props} />
      );
      break;
    default:
      botContent = null;
      break;
    }

    return (
      <React.Fragment>
        <div id={`bot-${this.props.bot.identifier}`}>
          {botContent}
        </div>
      </React.Fragment>
    );
  }
}

export default TeamBot;
