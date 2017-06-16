import React, { Component, PropTypes } from 'react';

class PenderCard extends Component {
  addTag() {
    const script = document.createElement('script');
    const version = this.props.mediaVersion || 0;
    script.src = `${this.props.penderUrl}/api/medias.js?version=${version}&url=${encodeURIComponent(this.props.url)}`;
    script.async = true;
    script.type = 'text/javascript';
    const card = document.getElementById('pender-card');
    if (card) {
      card.appendChild(script);
    }
  }

  removeTag() {
    const container = document.getElementById('pender-card');
    const loader = document.getElementById('pender-card-loader');
    if (loader) {
      container.innerHTML = loader.outerHTML;
    }
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

  shouldComponentUpdate(nextProps, nextState) {
    return ((nextProps.url != this.props.url) || (nextProps.mediaVersion != this.props.mediaVersion));
  }

  render() {
    return (
      <div id="pender-card" className="pender-card">
        <div id="pender-card-loader" className="pender-card__loader">
          {(() => {
            if (this.props.fallback) {
              return (this.props.fallback);
            }
            return (<svg className="spinner" width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="spinner-path" fill="none" strokeWidth="2" strokeLinecap="round" cx="33" cy="33" r="30" />
            </svg>);
          })()}
        </div>
      </div>
    );
  }
}

export default PenderCard;
