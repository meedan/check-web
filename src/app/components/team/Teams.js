import React, { Component, PropTypes } from 'react';
import SwitchTeams from './SwitchTeams.js'
import ContentColumn from '../layout/ContentColumn'
import Heading from '../layout/Heading'

class Teams extends Component {
  render() {
    return (
      <section className='teams'>
        <ContentColumn>
          <Heading>Your Teams</Heading>
          <SwitchTeams />
        </ContentColumn>
      </section>
    );
  }
}

export default Teams;
