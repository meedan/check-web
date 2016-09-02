import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';

class Header extends Component {
  render() {
    const { state, logout } = this.props;

    if (!state.app.token) {
      return null;
    }

    return (
      <header className='header'>
        <div className='header__team'><TeamHeader {...this.props} /></div>

        <ProjectHeader {...this.props} />
      </header>
    );
  }
}

export default Header;
