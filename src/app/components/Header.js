import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';

class Header extends Component {
  isProjectRoute() {
    return (
      this.props.location.pathname &&
      this.props.location.pathname.match(/project\/[0-9]+/)
    );
  }

  render() {
    const { state } = this.props;

    if (!state.app.token) {
      return null;
    }

    if (this.isProjectRoute()) {
      return (
        <header className='header header--project'>
          <div className='header__team'><TeamHeader {...this.props} /></div>
          <ProjectHeader {...this.props} />
        </header>
      );
    } else {
      return (
        <header className='header header--todo'>
          <img className='header--todo__brand' src='/img/logo/logo-1.svg'/>
        </header>
      )
    }
  }
}

export default Header;
