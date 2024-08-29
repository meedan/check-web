import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import cx from 'classnames/bind';
import AutoCompleteMediaItem from './AutoCompleteMediaItem';
import CreateMediaInput from './CreateMediaInput';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import CloseIcon from '../../icons/clear.svg';
import ExportToMediaIcon from '../../icons/export_to_media.svg';
import ImportToMediaIcon from '../../icons/import_to_media.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import dialogStyles from '../../styles/css/dialog.module.css';
import mediaStyles from './media.module.css';

class CreateRelatedMediaDialog extends React.Component {
  constructor(props) {
    super(props);

    this.formRef = React.createRef(null);

    this.state = {
      action: 'addThisToSimilar',
      mode: 'existing',
      selectedItem: null, // Used when action = addThisToSimilar
      selectedItems: [], // Used when action = addSimilarToThis
    };
  }

  handleActionChange = (event, action) => {
    if (action !== null) {
      this.setState({ action, selectedItem: null, selectedItems: [] });
    }
  };

  handleChange = (event, mode) => {
    this.setState({ mode, selectedItem: null, selectedItems: [] });
  };

  handleSelectExisting = (selectedItem, selected) => {
    if (this.state.action === 'addSimilarToThis') {
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
      if (this.state.action === 'addThisToSimilar' && this.state.selectedItem) {
        this.props.onSelect(this.state.selectedItem, true);
        this.setState({ selectedItem: null });
      } else if (this.state.action === 'addSimilarToThis' && this.state.selectedItems.length > 0) {
        this.state.selectedItems.forEach((item) => {
          this.props.onSelect(item, false);
        });
        this.setState({ selectedItems: [] });
      }
    }
  }

  submitExistingDisabled = () => (!this.state.selectedItem && !this.state.selectedItems.length);

  render() {
    const { action, mode } = this.state;
    const {
      hideNew,
      media,
      typesToShow,
    } = this.props;
    const formId = 'create-related-media-dialog-form';

    return (
      <Dialog className={dialogStyles['dialog-window']} fullWidth maxWidth="md" open={this.props.open}>
        <div className={dialogStyles['dialog-title']}>
          { hideNew ?
            <div className={dialogStyles['dialog-title-choice']}>
              {this.props.title}
              <ToggleButtonGroup
                exclusive
                value={this.state.action}
                variant="contained"
                onChange={this.handleActionChange}
              >
                <Tooltip
                  arrow
                  className={dialogStyles['toggle-button-tooltip']}
                  title={<FormattedMessage defaultMessage="DISABLED IMPORT" description="Tooltip text for when importing media into this item is not allowed" id="createMedia.importTooltip" />}
                >
                  <span>
                    <ButtonMain
                      disabled
                      iconLeft={<ImportToMediaIcon />}
                      label={<FormattedMessage defaultMessage="Import into this Media" description="Tab text for importing media into this item" id="createMedia.import" />}
                      size="default"
                      theme="text"
                      variant="text"
                    />
                  </span>
                </Tooltip>
                <ToggleButton
                  className={dialogStyles['dialog-title-choice-option']}
                  key="1"
                  value="addSimilarToThis"
                >
                  <ImportToMediaIcon />
                  <FormattedMessage defaultMessage="Import into this Media" description="Tab text for importing media into this item" id="createMedia.import" />
                </ToggleButton>
                <Tooltip
                  arrow
                  className={dialogStyles['toggle-button-tooltip']}
                  title={<FormattedMessage defaultMessage="DISABLED EXPOR" description="Tooltip text for when exporting media from this item is not allowed" id="createMedia.exportTooltip" />}
                >
                  <span>
                    <ButtonMain
                      disabled
                      iconRight={<ExportToMediaIcon />}
                      label={<FormattedMessage defaultMessage="Export to another Media" description="Tab text for exporting media out of this item" id="createMedia.export" />}
                      size="default"
                      theme="text"
                      variant="text"
                    />
                  </span>
                </Tooltip>
                <ToggleButton
                  className={dialogStyles['dialog-title-choice-option']}
                  key="2"
                  value="addThisToSimilar"
                >
                  <FormattedMessage defaultMessage="Export to another Media" description="Tab text for exporting media out of this item" id="createMedia.export" />
                  <ExportToMediaIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div> :
            <Tabs
              indicatorColor="primary"
              textColor="primary"
              value={this.state.mode}
              onChange={this.handleChange}
            >
              <Tab
                id="create-media-dialog__tab-existing"
                label={
                  <FormattedMessage defaultMessage="Add existing item" description="Tab text for adding an existing media item" id="createMedia.existing" />
                }
                value="existing"
              />
              <Tab
                id="create-media-dialog__tab-new"
                label={
                  <FormattedMessage defaultMessage="Add new item" description="Tab text for adding a new item" id="createMedia.addNew" />
                }
                value="new"
              />
            </Tabs>
          }
          <ButtonMain
            className={dialogStyles['dialog-close-button']}
            iconCenter={<CloseIcon />}
            size="small"
            theme="text"
            variant="text"
            onClick={this.props.onDismiss}
          />
        </div>
        <div className={cx(dialogStyles['dialog-content'], mediaStyles['media-item-autocomplete-wrapper'])}>
          { mode === 'new' &&
            <CreateMediaInput
              formId={formId}
              isSubmitting={this.props.isSubmitting}
              message={this.props.message}
              team={this.props.team}
              onSubmit={this.props.onSubmit}
            />
          }
          { mode === 'existing' &&
            <>
              { this.props.message && <><Alert contained title={this.props.message} variant="error" /><br /></> }
              <AutoCompleteMediaItem
                customFilter={this.props.customFilter}
                dbid={media ? media.dbid : null}
                disablePublished={Boolean(this.props.disablePublished)}
                media={media}
                multiple={action === 'addSimilarToThis'}
                showFilters={Boolean(this.props.showFilters)}
                typesToShow={typesToShow}
                onSelect={this.handleSelectExisting}
              />
            </>
          }
        </div>
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            buttonProps={{
              id: 'create-media-dialog__dismiss-button',
            }}
            label={
              <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={this.props.onDismiss}
          />
          { mode === 'new' &&
            <ButtonMain
              buttonProps={{
                id: 'create-media-dialog__submit-button',
                form: formId,
                type: 'submit',
              }}
              disabled={this.props.isSubmitting}
              label={this.props.isSubmitting ?
                <FormattedMessage defaultMessage="Submitting…" description="Generic loading message when a form is in process of being submitted" id="global.submitting" /> :
                this.props.submitButtonLabel(this.state.selectedItem ? 2 : this.state.selectedItems.length)
              }
              size="default"
              theme="info"
              variant="contained"
            />
          }
          { mode === 'existing' &&
            <ButtonMain
              buttonProps={{
                id: 'create-media-dialog__submit-button',
              }}
              disabled={this.submitExistingDisabled() || this.props.isSubmitting}
              label={this.props.isSubmitting ?
                <FormattedMessage defaultMessage="Submitting…" description="Generic loading message when a form is in process of being submitted" id="global.submitting" /> :
                this.props.submitButtonLabel(this.state.selectedItem ? 2 : this.state.selectedItems.length)
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={this.handleSubmitExisting}
            />
          }
        </div>
      </Dialog>
    );
  }
}

export default CreateRelatedMediaDialog;
