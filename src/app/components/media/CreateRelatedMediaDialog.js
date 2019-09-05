import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AutoCompleteMediaItem from './AutoCompleteMediaItem';
import CreateMediaInput from './CreateMediaInput';
import Message from '../Message';
import globalStrings from '../../globalStrings';

class CreateRelatedMediaDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'new',
      selectedId: null,
    };
  }

  handleChange = (event, mode) => {
    this.setState({ mode, selectedId: null });
  };

  handleSelectExisting = (selectedId) => {
    this.setState({ selectedId });
  };

  handleSubmit = () => {
    if (this.props.onSelect && this.state.selectedId) {
      this.props.onSelect(this.state.selectedId);
      return;
    }

    const submitButton = document.getElementById('create-media-submit');
    if (submitButton) {
      submitButton.click();
    }
  };

  submitDisabled = () => (this.state.mode === 'existing' && !this.state.selectedId);

  render() {
    const { mode } = this.state;
    const { media } = this.props;

    return (
      <Dialog open={this.props.open} fullWidth>
        <DialogContent>
          <Tabs
            value={this.state.mode}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleChange}
            fullWidth
          >
            <Tab
              value="new"
              label={
                <FormattedMessage id="createMedia.addNew" defaultMessage="Add new item" />
              }
            />
            <Tab
              value="existing"
              label={
                <FormattedMessage id="createMedia.existing" defaultMessage="Add existing item" />
              }
            />
          </Tabs>
          { mode === 'new' &&
            <CreateMediaInput
              message={this.props.message}
              isSubmitting={this.props.isSubmitting}
              onSubmit={this.props.onSubmit}
              submitHidden
            />
          }
          { mode === 'existing' &&
            <div>
              <Message message={this.props.message} />
              <AutoCompleteMediaItem
                media={media}
                onSelect={this.handleSelectExisting}
              />
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button id="create-media-dialog__dismiss-button" onClick={this.props.onDismiss}>
            {this.props.intl.formatMessage(globalStrings.cancel)}
          </Button>
          <Button
            id="create-media-dialog__submit-button"
            color="primary"
            onClick={this.handleSubmit}
            disabled={this.submitDisabled()}
          >
            {this.props.intl.formatMessage(globalStrings.submit)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(CreateRelatedMediaDialog);
