import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';
import Breadcrumb from './layout/Breadcrumb';
import MediaHeader from './media/MediaHeader';
import HeaderActions from './HeaderActions';

class Header extends Component {
  isSubdomain(hostname) { // TODO: replace with helpers.js::teamSubdomain or similar
    return (hostname !== 'checkmedia.org' && hostname !== 'qa.checkmedia.org');
  }

  render() {
    const { state } = this.props;
    const path = this.props.location ? this.props.location.pathname : null;

    if (!state.app.token) {
      return null;
    }

    const defaultHeader = (
      <header className='header header--default'>
        <div className='header__container'>
          <Breadcrumb url='/' title={null} />
          <HeaderActions {...this.props} />
        </div>
      </header>
    );

    if (!path) {
      return defaultHeader;
    }

    if (path.match(/media\/[0-9]+/)) {
      const projectUrl = path.match(/(.*)\/media\/[0-9]+/)[1];
      return (
        <header className='header header--media'>
          <div className='header__container'>
            <Breadcrumb url={projectUrl} title='« Back to Project' />
            <MediaHeader {...this.props} />
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/project\/[0-9]+/)) {
      return (
        <header className='header header--project'>
          <div className='header__container'>
            <div className='header__team'><TeamHeader {...this.props} /></div>
            <ProjectHeader {...this.props} />
            {/* TODO: <HeaderActions {...this.props} /> */}
          </div>
        </header>
      );
    }

    if (this.isSubdomain(window.location.hostname) && path.match(/^\/(join|members)/)) {
      const teamUrl = path.match(/(.*)\/(join|members)/)[1];
      return (
        <header className='header header--team-subpage'>
          <div className='header__container'>
            <Breadcrumb url={teamUrl} title='« Back to Team' />
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (this.isSubdomain(window.location.hostname) && path.match(/^\/(teams\/new)?$/)) {
      return (
        <header className='header header--team'>
          <div className='header__container'>
            <Breadcrumb url='/teams' title='« Your Teams' />
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    return defaultHeader;
  }
}

export default Header;
