import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { getErrorMessage } from '../../helpers';
import CheckContext from '../../CheckContext';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { stringHelper } from '../../customHelpers';
import { Row } from '../../styles/js/shared';


const messages = defineMessages({
  error: {
    id: 'tagInput.error',
    defaultMessage: 'Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists.',
  },
  search: {
    id: 'tagInput.search',
    defaultMessage: 'Search or add new tag',
  },
});

class TagInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitDisabled: true,
      message: null,
      value: '',
    };
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!this.state.submitDisabled) {
        this.setState({ submitDisabled: true });
        this.handleSubmit();
      }
      e.preventDefault();
    }
  }

  handleChange(e) {
    const submitDisabled = !e.target.value.length;
    const { value } = e.target;

    if (this.props.onChange) {
      this.props.onChange(value);
    }

    this.setState({ submitDisabled, value });
  }

  handleSubmit() {
    const { value } = this.state;
    const { media } = this.props;
    const context = new CheckContext(this).getContextStore();

    const onSuccess = (data) => {
      this.setState({ value: '', message: null });

      if (this.props.onChange) {
        this.props.onChange('');
      }

      const pm = data.createTag.project_media;
      let path = '';
      let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
      if (currentProjectId) {
        [path, currentProjectId] = currentProjectId;
      }
      if (pm.project_ids.length > 0 && currentProjectId
        && pm.project_ids.indexOf(parseInt(currentProjectId, 10)) === -1) {
        const newPath = window.location.pathname.replace(path, `project/${pm.project_ids.pop()}`);
        window.location.assign(newPath);
      }
    };

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
    };

    createTag(
      {
        media,
        value,
        annotator: context.currentUser,
      },
      onSuccess, onFailure,
    );
  }

  render() {
    return (
      <Box p={2}>
        <Row>
          <TextField
            id="tag-input__tag-input"
            value={this.state.value}
            error={this.state.message}
            helperText={this.state.message}
            onChange={this.handleChange.bind(this)}
            onKeyPress={this.handleKeyPress.bind(this)}
            placeholder={this.props.intl.formatMessage(messages.search)}
          />
          <Box ml="auto">
            <Button
              onClick={this.handleSubmit.bind(this)}
              color="primary"
              disabled={this.state.submitDisabled}
            >
              <FormattedMessage
                id="tagInput.addTag"
                defaultMessage="Add Tag"
              />
            </Button>
          </Box>
        </Row>
      </Box>
    );
  }
}

TagInput.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TagInput);
