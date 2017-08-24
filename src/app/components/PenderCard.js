import React, { Component } from 'react';
import styled from 'styled-components';
import CircularProgress from 'material-ui/CircularProgress';
import { units } from '../styles/js/variables';

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
    // TODO: Refine loader. It never shows, I think it's removed too early.
    // Here I've attempted to remove it .onload but it's still never showing. — 2017-8-23 CGB
    if (loader) {
      script.onload = card.removeChild(loader);
    }
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
      <PenderCardContainer
        id={this.props.domId}
        className="pender-card"
      >
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
      </PenderCardContainer>
    );
  }
}

PenderCard.defaultProps = {
  domId: '0',
};


export default PenderCard;
