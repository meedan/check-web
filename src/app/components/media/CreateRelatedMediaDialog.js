import React from 'react';
import Box from '@material-ui/core/Box';
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
    const { media, hideNew, typesToShow } = this.props;
    const formId = 'create-related-media-dialog-form';

    return (
      <Dialog open={this.props.open} fullWidth>
        <DialogContent>
          { hideNew ?
            <Box clone pl={0} pr={0}>
              <DialogTitle>
                <FormattedMessage
                  id="createMedia.existingReport"
                  defaultMessage="Add to imported report"
                />
              </DialogTitle>
            </Box> :
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
          <Box mt={units(2)} mb={units(2)}>
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
                  typesToShow={typesToShow}
                />
              </StyledAutoCompleteWrapper>
            }
          </Box>
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
            >
              { this.props.isSubmitting ?
                <FormattedMessage {...globalStrings.submitting} /> :
                <FormattedMessage {...globalStrings.submit} /> }
            </Button>
          }
          { mode === 'existing' &&
            <Button
              id="create-media-dialog__submit-button"
              color="primary"
              onClick={this.handleSubmitExisting}
              disabled={this.submitExistingDisabled() || this.props.isSubmitting}
            >
              { this.props.isSubmitting ?
                <FormattedMessage {...globalStrings.submitting} /> :
                <FormattedMessage {...globalStrings.submit} /> }
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default CreateRelatedMediaDialog;
