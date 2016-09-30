import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';
import Breadcrumb from './layout/Breadcrumb';
import MediaHeader from './media/MediaHeader';
import HeaderActions from './HeaderActions';

class Header extends Component {
  render() {
    const { state } = this.props;
    const path = this.props.location ? this.props.location.pathname : null;

    if (!state.app.token) {
      return null;
    }

    const defaultHeader = (
      <header className='header header--default'>
        <Breadcrumb url='/' title={null} />
        <HeaderActions {...this.props} />
      </header>
    );

    if (!path) {
      return defaultHeader;
    }

    if (path.match(/media\/[0-9]+/)) {
      const projectUrl = path.match(/(.*)\/media\/[0-9]+/)[1];
      return (
        <header className='header header--media'>
          <Breadcrumb url={projectUrl} title='« Back to Project' />
          <MediaHeader {...this.props} />
          <HeaderActions {...this.props} />
        </header>
      );
    }

    if (path.match(/project\/[0-9]+/)) {
      return (
        <header className='header header--project'>
          <div className='header__team'><TeamHeader {...this.props} /></div>
          <ProjectHeader {...this.props} />
          {/* TODO: <HeaderActions {...this.props} /> */}
        </header>
      );

    }

    if (path.match(/team\/[0-9]+/)) {
      return (
        <header className='header header--team'>
          <HeaderActions {...this.props} />
        </header>
      );
    }

    return defaultHeader;
  }
}

export default Header;
