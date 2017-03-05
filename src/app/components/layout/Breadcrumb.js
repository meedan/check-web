import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import MdArrowBack from 'react-icons/lib/md/arrow-back';

class Breadcrumb extends Component {
  render() {
    const { url, label } = this.props;

    return (
      <Link to={url} className="breadcrumb" title={label ? `« ${label}` : null}>
        <MdArrowBack />
        {label ? <span className="breadcrumb__label">{label}</span> : null}
      </Link>
    );
  }
}

export default Breadcrumb;
