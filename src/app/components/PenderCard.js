import React, { Component } from 'react';

class PenderCard extends Component {

  componentDidMount() {
    this.addTag(this.props.domId);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.url !== this.props.url || nextProps.mediaVersion !== this.props.mediaVersion;
  }

  componentDidUpdate(prevProps) {
    this.removeTag(prevProps.domId);
    this.addTag(this.props.domId);
  }

  componentWillUnmount() {
    this.removeTag(this.props.domId);
  }

  addTag(domId) {
    const script = document.createElement('script');
    const version = this.props.mediaVersion || 0;
    script.src = `${this.props.penderUrl}/api/medias.js?version=${version}&url=${encodeURIComponent(
      this.props.url,
    )}`;
    script.async = true;
    script.type = 'text/javascript';
    const card = document.getElementById(domId);
    const loader = document.getElementById(`pender-card-loader-${domId}`);
    if (card) {
      card.appendChild(script);
    }
    // TODO: Refine loader. It never shows, it's removed too early — 2017-8-23 CGB
    script.onload = card.removeChild(loader);
  }

  removeTag(domId) {
    const container = document.getElementById(domId);
    const loader = document.getElementById(`pender-card-loader-${domId}`);
    if (loader) {
      container.innerHTML = loader.outerHTML;
    }
  }

  render() {
    return (
      <div id={this.props.domId} className="pender-card">
        <div id={`pender-card-loader-${this.props.domId}`} className="pender-card__loader">
          {(() => {
            if (this.props.fallback) {
              return this.props.fallback;
            }
            return (
              <svg
                className="spinner"
                width="40px"
                height="40px"
                viewBox="0 0 66 66"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="spinner-path"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  cx="33"
                  cy="33"
                  r="30"
                />
              </svg>
            );
          })()}
        </div>
      </div>
    );
  }
}

export default PenderCard;
