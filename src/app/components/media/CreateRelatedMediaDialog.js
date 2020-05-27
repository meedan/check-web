import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import AutoCompleteMediaItem from './AutoCompleteMediaItem';
import CreateMediaInput from './CreateMediaInput';
import Message from '../Message';
import globalStrings from '../../globalStrings';
import { units } from '../../styles/js/shared';

const StyledAutoCompleteWrapper = styled.div`
  height: ${units(10)};
`;

class CreateRelatedMediaDialog extends React.Component {
  constructor(props) {
    super(props);

    this.formRef = React.createRef(null);

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
  }

  handleSubmitExisting = () => {
    if (this.props.onSelect && this.state.selectedId) {
      this.props.onSelect(this.state.selectedId);
    }
  }

  submitExistingDisabled = () => !this.state.selectedId

  render() {
    const { mode } = this.state;
    const { media } = this.props;
    const formId = 'create-related-media-dialog-form';

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
              formId={formId}
              isSubmitting={this.props.isSubmitting}
              onSubmit={this.props.onSubmit}
              noSource
            />
          }
          { mode === 'existing' &&
            <StyledAutoCompleteWrapper>
              <Message message={this.props.message} />
              <AutoCompleteMediaItem
                media={media}
                onSelect={this.handleSelectExisting}
              />
            </StyledAutoCompleteWrapper>
          }
        </DialogContent>
        <DialogActions>
          <Button id="create-media-dialog__dismiss-button" onClick={this.props.onDismiss}>
            {this.props.intl.formatMessage(globalStrings.cancel)}
          </Button>
          { mode === 'new' &&
            <Button
              type="submit"
              id="create-media-dialog__submit-button"
              color="primary"
              form={formId}
            >
              <FormattedMessage {...globalStrings.submit} />
            </Button>
          }
          { mode === 'existing' &&
            <Button
              id="create-media-dialog__submit-button"
              color="primary"
              onClick={this.handleSubmitExisting}
              disabled={this.submitExistingDisabled()}
            >
              <FormattedMessage {...globalStrings.submit} />
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(CreateRelatedMediaDialog);
