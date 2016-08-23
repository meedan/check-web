import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Project extends Component {
  render() {
    return (
      <div className='project'>
        <Link to="/medias/new" id="link-medias-new" className='project__new-media-link' title="Create a report">+ New report...</Link>
      </div>
    );
  }
}

export default Project;
