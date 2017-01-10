import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Caret from '../Caret';

class Breadcrumb extends Component {
  render() {
    const { url, label } = this.props;

    return (
      <Link to={url} className="breadcrumb" title={label ? `« ${label}` : null}>
        <Caret left />
        {label ? <span className="breadcrumb__label">{label}</span> : null}
      </Link>
    );
  }
}

export default Breadcrumb;
