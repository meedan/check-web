import React, { Component } from 'react';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import CircularProgress from './CircularProgress';
import { units } from '../styles/js/shared';

const PenderCardContainer = styled.div`
  max-height: ${units(250)};
  min-height: ${units(25)};
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;

  iframe {
    bottom: 0;
    position: relative;
    top: 0;
    z-index: 1;
    left: 0;
    right: 0;
    width: 100%;
  }
`;

const PenderCardLoader = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

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

  addTag() {
    const script = document.createElement('script');
    const version = this.props.mediaVersion || 0;
    script.src = `${config.penderUrl}/api/medias.js?version=${version}&url=${encodeURIComponent(this.props.url)}`;
    script.async = true;
    script.type = 'text/javascript';
    const card = document.getElementById(this.props.domId);
    const loader = document.getElementById(`pender-card-loader-${this.props.domId}`);
    if (card) {
      card.appendChild(script);
    }

    if (loader) {
      script.onload = () => { loader.style.display = 'none'; };
    }
  }

  removeTag() {
    const container = document.getElementById(this.props.domId);
    const loader = document.getElementById(`pender-card-loader-${this.props.domId}`);

    if (loader) {
      container.innerHTML = loader.outerHTML;
    }
  }

  render() {
    return (
      <div>
        <PenderCardContainer
          id={this.props.domId}
          className="pender-card"
          style={{ maxHeight: 'none' }}
        />

        <PenderCardLoader
          id={`pender-card-loader-${this.props.domId}`}
          className="pender-card__loader"
        >
          {(() => {
            if (this.props.fallback) {
              return this.props.fallback;
            }
            return (
              <div><CircularProgress thickness={1} /></div>
            );
          })()}
        </PenderCardLoader>
      </div>
    );
  }
}

PenderCard.defaultProps = {
  domId: '0',
};

export default PenderCard;
