import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { getErrorMessage } from '../../helpers';
import CheckContext from '../../CheckContext';
import { units, Row } from '../../styles/js/shared';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  error: {
    id: 'tagInput.error',
    defaultMessage: 'Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists.',
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

    const onSuccess = () => {
      this.setState({ value: '', message: null });

      if (this.props.onChange) {
        this.props.onChange('');
      }
    };

    const onFailure = (transaction) => {
      this.setState({
        message: getErrorMessage(
          transaction,
          this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }),
        ),
      });
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
      <div style={{ padding: units(2) }}>
        <Row>
          <TextField
            id="tag-input__tag-input"
            value={this.state.value}
            errorText={this.state.message}
            onChange={this.handleChange.bind(this)}
            onKeyPress={this.handleKeyPress.bind(this)}
            hintText={
              <FormattedMessage
                id="tagInput.search"
                defaultMessage="Search or add new tag"
              />
            }
          />
          <FlatButton
            style={{ marginLeft: 'auto' }}
            label={
              <FormattedMessage
                id="tagInput.addTag"
                defaultMessage="Add Tag"
              />
            }
            onClick={this.handleSubmit.bind(this)}
            primary
            disabled={this.state.submitDisabled}
          />
        </Row>
      </div>
    );
  }
}

TagInput.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TagInput);
