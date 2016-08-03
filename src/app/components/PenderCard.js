import React, { Component, PropTypes } from 'react';

class PenderCard extends Component {
  addTag() {
    const script = document.createElement('script');
    script.src = this.props.penderUrl + '/api/medias.js?url=' + this.props.url;
    script.async = true;
    document.getElementById('pender-card').appendChild(script);
  }

  removeTag() {
    const container = document.getElementById('pender-card');
    container.innerHTML = '<span id="pender-card-loader">Loading...</span>';
  }

  componentDidMount() {
    this.addTag();
  }

  componentDidUpdate() {
    this.removeTag();
    this.addTag();
  }

  componentWillUnmount() {
    this.removeTag();
  }

  render() {
    return (
      <div id="pender-card">
        <span id="pender-card-loader">Loading...</span> 
      </div>
    );
  }
}

export default PenderCard;
