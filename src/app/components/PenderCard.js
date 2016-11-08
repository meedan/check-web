import React, { Component, PropTypes } from 'react';
import Spinner from 'react-spinner';

class PenderCard extends Component {
  addTag() {
    const script = document.createElement('script');
    script.src = this.props.penderUrl + '/api/medias.js?url=' + encodeURIComponent(this.props.url);
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
      <div id="pender-card" className='pender-card'>
        <div id="pender-card-loader" className='pender-card__loader'>
          {(() => {
            if (this.props.fallback) {
              return (this.props.fallback);
            }
            else {
              return (<Spinner />);
            }
          })()}
        </div>
      </div>
    );
  }
}

export default PenderCard;
