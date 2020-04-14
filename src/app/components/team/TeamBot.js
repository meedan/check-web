import React, { Component } from 'react';
import Form from '@meedan/react-jsonschema-form-material-ui-v1';
import SmoochBotSettings from './SmoochBotSettings';

class TeamBot extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.props.bot.name === 'Smooch') {
      return (<SmoochBotSettings {...this.props} />);
    }
    return (<Form {...this.props} />);
  }
}

export default TeamBot;
