// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=4-45716&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Tooltip from '@material-ui/core/Tooltip';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import CheckCircleOutlineOutlinedIcon from '../../../icons/check_circle.svg';
import IconClose from '../../../icons/clear.svg';
import InfoOutlinedIcon from '../../../icons/info.svg';
import ReportProblemOutlinedIcon from '../../../icons/report_problem.svg';
import styles from './Alert.module.css';

const buttonThemes = {
  info: 'brand',
  success: 'validation',
  warning: 'alert',
  error: 'error',
};

const buttonTheme = alertVariant => buttonThemes[alertVariant] || 'brand';

const Alert = ({
  className,
  title,
  content,
  variant,
  buttonLabel,
  icon,
  floating,
  banner,
  onButtonClick,
  onClose,
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
        <span className={cx('typography-subtitle2', styles.title)}>
          {title}
        </span>
      }
      { content &&
        <div className={cx('test__alert-content', 'typography-body1', styles.content)}>
          {content}
        </div>
      }
      { buttonLabel &&
        <div className={styles.actionsWrapper}>
          <ButtonMain label={buttonLabel} variant="contained" size="small" theme={buttonTheme(variant)} onClick={onButtonClick} />
        </div>
      }
    </div>
    { onClose &&
      <div className={styles.closeButtonWrapper}>
        <Tooltip title={
          <FormattedMessage
            id="alert.closeButton"
            defaultMessage="Close alert"
            description="Tooltip for close alert"
          />
        }
        >
          <span>
            <ButtonMain variant="text" size="small" theme={buttonTheme(variant)} iconCenter={<IconClose />} onClick={onClose} />
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
  icon: true,
};

Alert.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  content: PropTypes.node,
  floating: PropTypes.bool,
  banner: PropTypes.bool,
  icon: PropTypes.bool,
  buttonLabel: PropTypes.string,
  onButtonClick: PropTypes.func,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
};

export default Alert;
