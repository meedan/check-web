/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
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
      mode: 'existing',
      selectedItem: null, // Used when props.multiple = false
      selectedItems: [], // Used when props.multiple = true
    };
  }

  handleChange = (event, mode) => {
    this.setState({ mode, selectedItem: null, selectedItems: [] });
  };

  handleSelectExisting = (selectedItem, selected) => {
    if (this.props.multiple) {
      const selectedItems = this.state.selectedItems.slice();
      const i = selectedItems.findIndex(item => item.dbid === selectedItem.dbid);
      if (selected) {
        if (i === -1) {
          selectedItems.push(selectedItem);
        }
      } else {
        selectedItems.splice(i, 1);
      }
      this.setState({ selectedItems });
    } else {
      this.setState({ selectedItem });
    }
  }

  handleSubmitExisting = () => {
    if (this.props.onSelect) {
      if (!this.props.multiple && this.state.selectedItem) {
        this.props.onSelect(this.state.selectedItem);
      } else if (this.props.multiple && this.state.selectedItems.length > 0) {
        this.state.selectedItems.forEach((item) => {
          this.props.onSelect(item);
        });
      }
    }
  }

  submitExistingDisabled = () => (!this.state.selectedItem && !this.state.selectedItems.length);

  render() {
    const { mode } = this.state;
    const {
      media,
      hideNew,
      typesToShow,
    } = this.props;
    const formId = 'create-related-media-dialog-form';

    return (
      <Dialog open={this.props.open} fullWidth maxWidth="md">
        <DialogContent style={{ minHeight: 600 }}>
          { hideNew ?
            <DialogTitle style={{ paddingLeft: 0, paddingRight: 0 }}>
              {this.props.title}
            </DialogTitle> :
            <Tabs
              value={this.state.mode}
              indicatorColor="primary"
              textColor="primary"
              onChange={this.handleChange}
            >
              <Tab
                id="create-media-dialog__tab-existing"
                value="existing"
                label={
                  <FormattedMessage id="createMedia.existing" defaultMessage="Add existing item" />
                }
              />
              <Tab
                id="create-media-dialog__tab-new"
                value="new"
                label={
                  <FormattedMessage id="createMedia.addNew" defaultMessage="Add new item" />
                }
              />
            </Tabs> }
          <div style={{ marginTop: units(2), marginBottom: units(2) }}>
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
                  dbid={media ? media.dbid : null}
                  onSelect={this.handleSelectExisting}
                  typesToShow={typesToShow}
                  customFilter={this.props.customFilter}
                  showFilters={Boolean(this.props.showFilters)}
                  multiple={Boolean(this.props.multiple)}
                  disablePublished={Boolean(this.props.disablePublished)}
                />
              </StyledAutoCompleteWrapper>
            }
          </div>
        </DialogContent>
        <DialogActions>
          <Button id="create-media-dialog__dismiss-button" onClick={this.props.onDismiss}>
            <FormattedMessage {...globalStrings.cancel} />
          </Button>
          { mode === 'new' &&
            <Button
              type="submit"
              id="create-media-dialog__submit-button"
              color="primary"
              form={formId}
              disabled={this.props.isSubmitting}
              variant="contained"
            >
              { this.props.isSubmitting ?
                <FormattedMessage {...globalStrings.submitting} /> :
                this.props.submitButtonLabel(this.state.selectedItems.length)
              }
            </Button>
          }
          { mode === 'existing' &&
            <Button
              id="create-media-dialog__submit-button"
              color="primary"
              onClick={this.handleSubmitExisting}
              disabled={this.submitExistingDisabled() || this.props.isSubmitting}
              variant="contained"
            >
              { this.props.isSubmitting ?
                <FormattedMessage {...globalStrings.submitting} /> :
                this.props.submitButtonLabel(this.state.selectedItems.length)
              }
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default CreateRelatedMediaDialog;
