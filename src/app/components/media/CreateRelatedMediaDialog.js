import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import cx from 'classnames/bind';
import AutoCompleteMediaItem from './AutoCompleteMediaItem';
import CreateMediaInput from './CreateMediaInput';
import Message from '../Message';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import dialogStyles from '../../styles/css/dialog.module.css';
import mediaStyles from './media.module.css';

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
        this.setState({ selectedItem: null });
      } else if (this.props.multiple && this.state.selectedItems.length > 0) {
        this.state.selectedItems.forEach((item) => {
          this.props.onSelect(item);
        });
        this.setState({ selectedItems: [] });
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
      <Dialog className={dialogStyles['dialog-window']} open={this.props.open} fullWidth maxWidth="md">
        <div className={dialogStyles['dialog-title']}>
          { hideNew ?
            this.props.title :
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
                  <FormattedMessage id="createMedia.existing" defaultMessage="Add existing item" description="Tab text for adding an existing media item" />
                }
              />
              <Tab
                id="create-media-dialog__tab-new"
                value="new"
                label={
                  <FormattedMessage id="createMedia.addNew" defaultMessage="Add new item" description="Tab text for adding a new item" />
                }
              />
            </Tabs>
          }
        </div>
        <div className={cx(dialogStyles['dialog-content'], mediaStyles['media-item-autocomplete-wrapper'])}>
          { mode === 'new' &&
            <CreateMediaInput
              message={this.props.message}
              formId={formId}
              isSubmitting={this.props.isSubmitting}
              onSubmit={this.props.onSubmit}
              team={this.props.team}
            />
          }
          { mode === 'existing' &&
            <>
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
            </>
          }
        </div>
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            buttonProps={{
              id: 'create-media-dialog__dismiss-button',
            }}
            variant="text"
            theme="lightText"
            size="default"
            onClick={this.props.onDismiss}
            label={
              <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
            }
          />
          { mode === 'new' &&
            <ButtonMain
              buttonProps={{
                id: 'create-media-dialog__submit-button',
                form: formId,
                type: 'submit',
              }}
              theme="brand"
              size="default"
              variant="contained"
              disabled={this.props.isSubmitting}
              label={this.props.isSubmitting ?
                <FormattedMessage id="global.submitting" defaultMessage="Submitting…" description="Generic loading message when a form is in process of being submitted" /> :
                this.props.submitButtonLabel(this.state.selectedItems.length)
              }
            />
          }
          { mode === 'existing' &&
            <ButtonMain
              buttonProps={{
                id: 'create-media-dialog__submit-button',
              }}
              theme="brand"
              size="default"
              variant="contained"
              onClick={this.handleSubmitExisting}
              disabled={this.submitExistingDisabled() || this.props.isSubmitting}
              label={this.props.isSubmitting ?
                <FormattedMessage id="global.submitting" defaultMessage="Submitting…" description="Generic loading message when a form is in process of being submitted" /> :
                this.props.submitButtonLabel(this.state.selectedItems.length)
              }
            />
          }
        </div>
      </Dialog>
    );
  }
}

export default CreateRelatedMediaDialog;
