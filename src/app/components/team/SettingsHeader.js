/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import HelpIcon from '../../icons/help.svg';
import styles from './SettingsHeader.module.css';

const SettingsHeader = ({
  actionButton,
  className,
  context,
  extra,
  helpUrl,
  style,
  title,
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
      <div className={styles['title-actions-wrapper']}>
        <div className={styles['title-wrapper']}>
          <h6 className="component__settings-header">
            {title}
            { helpUrl &&
              <ButtonMain iconCenter={<HelpIcon />} size="default" theme="lightText" variant="text" onClick={handleHelp} />
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
      { context &&
        <div className={styles['settings-header-context']}>
          {context}
        </div>
      }
    </div>
  );
};

SettingsHeader.defaultProps = {
  context: null,
  actionButton: null,
  extra: null,
  helpUrl: null,
  className: '',
  style: {},
};

SettingsHeader.propTypes = {
  title: PropTypes.node.isRequired,
  context: PropTypes.element,
  helpUrl: PropTypes.string,
  actionButton: PropTypes.node,
  extra: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default SettingsHeader;
