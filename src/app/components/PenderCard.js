import React, { Component } from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import MediasLoading from './media/MediasLoading';
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
          id={this.props.domId}
          className={cx('pender-card', styles['pender-card'])}
          style={{ maxHeight: 'none' }}
        />

        <div
          id={`pender-card-loader-${this.props.domId}`}
          className={cx('pender-card__loader', styles['pender-card-loader'])}
        >
          {(() => {
            if (this.props.fallback) {
              return this.props.fallback;
            }
            return (
              <MediasLoading theme="white" variant="inline" size="medium" />
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
