import React, { Component } from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import Loader from './cds/loading/Loader';
import styles from './PenderCard.module.css';

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
      <div className={styles['pender-card-wrapper']}>
        <div
          className={cx('pender-card', styles['pender-card'])}
          id={this.props.domId}
          style={{ maxHeight: 'none' }}
        />

        <div
          className={cx('pender-card__loader', styles['pender-card-loader'])}
          id={`pender-card-loader-${this.props.domId}`}
        >
          {(() => {
            if (this.props.fallback) {
              return this.props.fallback;
            }
            return (
              <Loader size="medium" theme="white" variant="inline" />
            );
          })()}
        </div>
      </div>
    );
  }
}

PenderCard.defaultProps = {
  domId: '0',
};

export default PenderCard;
