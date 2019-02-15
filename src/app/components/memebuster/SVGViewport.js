import React from 'react';
import template from './template';

class SVGViewport extends React.Component {
  componentDidMount() {
    this.applyParams();
  }

  componentDidUpdate() {
    this.applyParams();
  }

  applyParams() {
    const statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.style.fill = this.props.params.overlayColor;
      statusText.innerHTML = this.props.params.statusText;
    }

    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.style.fill = this.props.params.overlayColor;
    }

    const image = document.getElementById('image');
    if (image && this.props.params.image) {
      if (typeof this.props.params.image === 'string') {
        image.setAttribute('href', this.props.params.image);
      } else {
        image.setAttribute('href', this.props.params.image.preview);
      }
    } else {
      image.removeAttribute('href');
    }

    const teamAvatar = document.getElementById('teamAvatar');
    if (teamAvatar) {
      teamAvatar.setAttribute('href', this.props.params.teamAvatar);
    }

    const headline = document.getElementById('headline');
    if (headline) {
      headline.innerHTML = this.props.params.headline;
    }

    const description = document.getElementById('description');
    if (description) {
      description.innerHTML = this.props.params.description || '';
    }

    const teamName = document.getElementById('teamName');
    if (teamName) {
      teamName.innerHTML = this.props.params.teamName;
    }

    const teamUrl = document.getElementById('teamUrl');
    if (teamUrl) {
      teamUrl.innerHTML = this.props.params.teamUrl;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div id="svg-container" dangerouslySetInnerHTML={{ __html: template }} />
    );
  }
}

export default SVGViewport;
