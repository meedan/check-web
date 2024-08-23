/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=4-45716&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import CheckCircleOutlineOutlinedIcon from '../../../icons/check_circle.svg';
import IconClose from '../../../icons/clear.svg';
import InfoOutlinedIcon from '../../../icons/info.svg';
import ReportProblemOutlinedIcon from '../../../icons/report_problem.svg';
import styles from './Alert.module.css';

const buttonThemes = {
  info: 'info',
  success: 'validation',
  warning: 'alert',
  error: 'error',
};

const buttonTheme = alertVariant => buttonThemes[alertVariant] || 'info';

const Alert = ({
  banner,
  buttonLabel,
  className,
  contained,
  content,
  floating,
  icon,
  onButtonClick,
  onClose,
  title,
  variant,
}) => (
  <div
    className={cx(
      styles['alert-wrapper'],
      {
        [className]: true,
        [styles.info]: variant === 'info',
        [styles.success]: variant === 'success',
        [styles.warning]: variant === 'warning',
        [styles.error]: variant === 'error',
        [styles.floating]: floating,
        [styles.banner]: banner,
        [styles.contained]: contained,
      })
    }
  >
    { icon &&
      <div className={styles.iconWrapper}>
        { variant === 'error' && <ErrorOutlineIcon /> }
        { variant === 'success' && <CheckCircleOutlineOutlinedIcon /> }
        { variant === 'info' && <InfoOutlinedIcon /> }
        { variant === 'warning' && <ReportProblemOutlinedIcon /> }
      </div>
    }
    <div className={styles.contentWrapper}>
      { title &&
        <span className={styles.title}>
          {title}
        </span>
      }
      { content &&
        <div className={cx('test__alert-content', styles.content)}>
          {content}
        </div>
      }
      { buttonLabel &&
        <div className={styles.actionsWrapper}>
          <ButtonMain label={buttonLabel} size="small" theme={buttonTheme(variant)} variant="contained" onClick={onButtonClick} />
        </div>
      }
    </div>
    { onClose &&
      <div className={styles.closeButtonWrapper}>
        <Tooltip
          arrow
          title={
            <FormattedMessage
              defaultMessage="Close alert"
              description="Tooltip for close alert"
              id="alert.closeButton"
            />
          }
        >
          <span>
            <ButtonMain iconCenter={<IconClose />} size="small" theme={buttonTheme(variant)} variant="text" onClick={onClose} />
          </span>
        </Tooltip>
      </div>
    }
  </div>
);

Alert.defaultProps = {
  className: null,
  variant: 'info',
  content: null,
  title: null,
  buttonLabel: null,
  onButtonClick: null,
  onClose: null,
  floating: false,
  banner: false,
  contained: false,
  icon: true,
};

Alert.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  content: PropTypes.node,
  floating: PropTypes.bool,
  banner: PropTypes.bool,
  contained: PropTypes.bool,
  icon: PropTypes.bool,
  buttonLabel: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onButtonClick: PropTypes.func,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
};

export default Alert;
