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
  dates,
  extra,
  helpUrl,
  style,
  title,
}) => {
  const handleHelp = () => {
    window.open(helpUrl);
  };

  const [firstValue, ...rest] = dates;
  const lastValue = rest?.length > 0 ? rest[rest.length - 1] : firstValue;

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
          <h5 className="component__settings-header">
            {title}
            { helpUrl &&
              <ButtonMain iconCenter={<HelpIcon />} size="default" theme="lightText" variant="text" onClick={handleHelp} />
            }
          </h5>
        </div>
        { extra &&
        <div className={styles['extra-wrapper']}>
          {extra}
        </div>
        }
        <div className={styles['actions-container']}>
          { dates &&
            <div className={cx(styles['data-wrapper'], 'typography-h5')} >
              {firstValue} - {lastValue}
            </div>
          }
          { actionButton &&
            <div className={styles['buttons-wrapper']}>
              {actionButton}
            </div>
          }
        </div>
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
  helpUrl: null,
  className: '',
  extra: null,
  dates: [],
  style: {},
};

SettingsHeader.propTypes = {
  actionButton: PropTypes.node,
  className: PropTypes.string,
  context: PropTypes.element,
  dates: PropTypes.arrayOf(PropTypes.string),
  extra: PropTypes.node,
  helpUrl: PropTypes.string,
  style: PropTypes.object,
  title: PropTypes.node.isRequired,
};

export default SettingsHeader;
