import React, { Component, PropTypes } from 'react';

class PenderCard extends Component {
  addTag() {
    const script = document.createElement('script');
    script.src = `${this.props.penderUrl}/api/medias.js?url=${encodeURIComponent(this.props.url)}`;
    script.async = true;
    script.type = 'text/javascript';
    document.getElementById('pender-card').appendChild(script);
  }

  removeTag() {
    const container = document.getElementById('pender-card');
    const loader = document.getElementById('pender-card-loader');
    container.innerHTML = loader.outerHTML;
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
      <div id="pender-card" className="pender-card">
        <div id="pender-card-loader" className="pender-card__loader">
          {(() => {
            if (this.props.fallback) {
              return (this.props.fallback);
            } else {
              return (<svg className="spinner" width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle className="spinner-path" fill="none" strokeWidth="2" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
                </svg>);
            }
          })()}
        </div>
      </div>
    );
  }
}

export default PenderCard;
