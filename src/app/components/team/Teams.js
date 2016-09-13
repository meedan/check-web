import React, { Component, PropTypes } from 'react';
import SwitchTeams from './SwitchTeams.js'

class Teams extends Component {
  render() {
    return (
      <section className='teams'>
        <div className='teams__content'>
          <h2 className='teams__main-heading'>Your Teams</h2>
          <SwitchTeams />
        </div>
      </section>
    );
  }
}

export default Teams;
