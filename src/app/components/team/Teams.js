import React, { Component, PropTypes } from 'react';
import SwitchTeams from './SwitchTeams.js'
import DocumentTitle from 'react-document-title';
import { pageTitle } from '../../helpers';

class Teams extends Component {
  render() {
    return (
      <DocumentTitle title={pageTitle('Teams', true)}>
        <section className='teams'>
          <div className='teams__content'>
            <h2 className='teams__main-heading'>Your Teams</h2>
            <SwitchTeams />
          </div>
        </section>
      </DocumentTitle>
    );
  }
}

export default Teams;
