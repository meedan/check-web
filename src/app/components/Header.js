import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';

class Header extends Component {
  isProjectRoute() {
    console.log(this.props.location.pathname);
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

    return (
      <header className='header'>
        <div className='header__team'><TeamHeader {...this.props} /></div>

        {this.isProjectRoute() ? <ProjectHeader {...this.props} /> : null}
      </header>
    );
  }
}

export default Header;
