/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/i1LSbpQXKyA7dLc8AkgtKA/Articles?type=design&node-id=106-63346&mode=design&t=o7PouU0Z5ISH5G3K-0
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../alerts-and-prompts/Tooltip';
import IconClose from '../../../icons/clear.svg';
import styles from './Slideout.module.css';

const Slideout = ({
  cancelProps,
  content,
  footer,
  mainActionButton,
  onClose,
  optionalNode,
  secondaryActionButton,
  showCancel,
  title,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // add a slight delay to allow the slide in transition to appear smoothly
  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 10);
  }, []);

  // delay close to allow animation to complete
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 390);
  };

  return (
    <div className={cx(styles.slideoutMain, 'slideout', isOpen ? styles.slide : null)}>
      <div className={styles.slideoutContainer}>
        <div className={styles.slideoutTitle}>
          <div className={styles.slideoutTitleContent}>
            <h6>
              {title}
            </h6>
            <Tooltip
              arrow
              title={
                <FormattedMessage defaultMessage="Close Slideout" description="Button label for closing an open slideout" id="global.closeSlideout" />
              }
            >
              <span>
                <ButtonMain
                  iconCenter={<IconClose />}
                  size="small"
                  theme="beige"
                  variant="contained"
                  onClick={() => handleClose()}
                />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.slideoutBody}>
          {content}
        </div>
        { footer &&
          <div className={styles.slideoutFooter}>
            <div className={styles.slideoutFooterMain}>
              <div className={styles.slideoutFooterContent}>
                { showCancel &&
                  <ButtonMain
                    label={
                      <FormattedMessage
                        defaultMessage="Cancel"
                        description="Regular Cancel action label"
                        id="global.cancel"
                      />
                    }
                    theme="text"
                    variant="text"
                    onClick={() => handleClose()}
                    {...cancelProps}
                  />
                }
                { mainActionButton &&
                  <div>
                    {mainActionButton}
                  </div>
                }
                { optionalNode &&
                  <div>
                    {optionalNode}
                  </div>
                }
              </div>
              { secondaryActionButton &&
                <div className={styles.slideoutFooterContent}>
                  {secondaryActionButton}
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

  );
};

Slideout.defaultProps = {
  content: null,
  footer: false,
  showCancel: false,
  cancelProps: {},
  mainActionButton: null,
  secondaryActionButton: null,
  optionalNode: null,
};

Slideout.propTypes = {
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  content: PropTypes.node,
  footer: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  showCancel: PropTypes.bool,
  cancelProps: PropTypes.object,
  mainActionButton: PropTypes.instanceOf(ButtonMain),
  secondaryActionButton: PropTypes.instanceOf(ButtonMain),
  optionalNode: PropTypes.node,
};

export default Slideout;
