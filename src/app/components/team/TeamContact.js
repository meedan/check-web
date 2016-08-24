import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import ContactRoute from '../../relay/ContactRoute';
import TeamContactComponent from './TeamContactComponent';
import contactFragment from '../../relay/contactFragment';

const contactContainer = Relay.createContainer(TeamContactComponent, {
  fragments: {
    contact: () => contactFragment
  }
});

class TeamContact extends Component {
  render() {
    var route = new ContactRoute({ teamId: this.props.teamId });
    return (<Relay.RootContainer Component={contactContainer} route={route} />);
  }
}

export default TeamContact;
