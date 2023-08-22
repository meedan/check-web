import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import HelpIcon from '../../icons/help.svg';
import styles from './SettingsHeader.module.css';

const SettingsHeader = ({
  title,
  helpUrl,
  actionButton,
  extra,
  className,
  style,
}) => {
  const handleHelp = () => {
    window.open(helpUrl);
  };

  return (
    <div
      className={cx(
        'component__settings-header',
        styles['settings-header-wrapper'],
        {
          [className]: true,
        })
      }
      style={style}
    >
      <div className={styles['title-wrapper']}>
        <h6 className="component__settings-header">
          {title}
          { helpUrl &&
            <ButtonMain iconCenter={<HelpIcon />} variant="text" size="default" theme="lightText" onClick={handleHelp} />
          }
        </h6>
        { extra &&
          <div className={styles['extra-wrapper']}>
            {extra}
          </div>
        }
      </div>
      { actionButton &&
        <div className={styles['buttons-wrapper']}>
          {actionButton}
        </div>
      }
    </div>
  );
};

SettingsHeader.defaultProps = {
  actionButton: null,
  extra: null,
  helpUrl: null,
  className: '',
  style: {},
};

SettingsHeader.propTypes = {
  title: PropTypes.node.isRequired,
  helpUrl: PropTypes.string,
  actionButton: PropTypes.node,
  extra: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default SettingsHeader;
