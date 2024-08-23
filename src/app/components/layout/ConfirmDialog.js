/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmed: false,
    };
  }

  handleConfirmation = () => {
    this.setState({ confirmed: !this.state.confirmed });
  };

  handleCancel = () => {
    this.setState({ confirmed: false });
    if (this.props.handleClose) {
      this.props.handleClose();
    }
  }

  handleProceed = () => {
    this.setState({ confirmed: false });
    if (this.props.handleConfirm) {
      this.props.handleConfirm();
    }
  }

  render() {
    return (
      <Dialog
        className={styles['dialog-window']}
        open={this.props.open}
        onClose={this.props.handleClose}
      >
        <div className={styles['dialog-title']}>
          <h6>{this.props.title}</h6>
        </div>
        <div className={styles['dialog-content']}>
          { this.props.message && <><Alert contained title={this.props.message} variant="error" /><br /></> }
          {this.props.blurb}
          { this.props.handleConfirm ?
            <div className={inputStyles['form-fieldset']}>
              <div className={inputStyles['form-fieldset-field']}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.confirmed}
                      id="confirm-dialog__checkbox"
                      onChange={this.handleConfirmation.bind(this)}
                    />
                  }
                  label={this.props.checkBoxLabel}
                />
              </div>
            </div> : null
          }
        </div>
        <div className={styles['dialog-actions']}>
          <ButtonMain
            buttonProps={{
              id: 'confirm-dialog__cancel-action-button',
            }}
            label={this.props.cancelButtonLabel}
            size="default"
            theme="lightText"
            variant="text"
            onClick={this.handleCancel}
          />
          { this.props.handleConfirm ?
            <ButtonMain
              buttonProps={{
                id: 'confirm-dialog__confirm-action-button',
              }}
              disabled={this.props.disabled || !this.state.confirmed}
              label={this.props.continueButtonLabel}
              size="default"
              theme="info"
              variant="contained"
              onClick={this.handleProceed}
            /> : null
          }
        </div>
      </Dialog>
    );
  }
}

ConfirmDialog.defaultProps = {
  blurb: null,
  disabled: false,
  checkBoxLabel: <FormattedMessage defaultMessage="Yes" description="Positive label for a checkbox field" id="teamTasks.confirmAction" />,
  continueButtonLabel: <FormattedMessage defaultMessage="Continue" description="Button label to continue a process" id="teamTasks.continue" />,
  cancelButtonLabel: <FormattedMessage defaultMessage="Cancel" description="Button label to cancel a process" id="teamTasks.cancelAction" />,
  message: null,
  handleConfirm: null,
};

ConfirmDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func,
  open: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  message: PropTypes.object,
  blurb: PropTypes.node,
  disabled: PropTypes.bool,
  checkBoxLabel: PropTypes.node,
  continueButtonLabel: PropTypes.node,
  cancelButtonLabel: PropTypes.node,
};

export default ConfirmDialog;
