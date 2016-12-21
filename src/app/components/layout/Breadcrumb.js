import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Caret from '../Caret';

class Breadcrumb extends Component {
  render() {
    const { url, title } = this.props;

    return (
      <Link to={url} className="breadcrumb" title={title}>
        <Caret left />
      </Link>
    );
  }
}

export default Breadcrumb;
