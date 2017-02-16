import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { orange500 } from 'material-ui/styles/colors';
import CreateCommentMutation from '../../relay/CreateCommentMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/UpdateStatusMutation';
import CreateFlagMutation from '../../relay/CreateFlagMutation';
import CheckContext from '../../CheckContext';

const messages = defineMessages({
  invalidCommand: {
    id: 'addAnnotation.invalidCommand',
    defaultMessage: 'Invalid command'
  },
  annotationAdded: {
    id: 'addAnnotation.annotationAdded',
    defaultMessage: 'Your {type} was added!'
  },
  createTagFailed: {
    id: 'addAnnotation.createTagFailed',
    defaultMessage: 'Sorry, could not create the tag'
  },
  inputHint: {
    id: 'addAnnotation.inputHint',
    defaultMessage: 'Add a note about this report'
  },
  submitButton: {
    id: 'addAnnotation.submitButton',
    defaultMessage: 'Submit'
  },
  typeComment: {
    id: 'addAnnotation.typeComment',
    defaultMessage: 'comment'
  },
  typeTag: {
    id: 'addAnnotation.typeTag',
    defaultMessage: 'tag'
  },
  typeStatus: {
    id: 'addAnnotation.typeStatus',
    defaultMessage: 'status'
  },
  typeFlag: {
    id: 'addAnnotation.typeFlag',
    defaultMessage: 'flag'
  },
});

const styles = {
  errorStyle: {
    color: orange500,
  },
};

class AddAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      isSubmitting: false,
    };
  }

  parseCommand(input) {
    const matches = input.match(/^\/(comment|tag|status|flag) (.*)/);
    let command = { type: 'unk', args: null };
    if (matches !== null) {
      command.type = matches[1];
      command.args = matches[2];
    } else if (/^[^\/]/.test(input)) {
      command = { type: 'comment', args: input };
    }
    return command;
  }

  failure() {
    this.setState({ message: this.props.intl.formatMessage(messages.invalidCommand), isSubmitting: false });
  }

  success(message) {
    this.setState({ message: message, isSubmitting: false });
    const field = document.forms.addannotation.cmd;
    field.value = '';
    field.blur();
  }

  fail(transaction) {
    const that = this;
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.createTagFailed);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) { }
    that.setState({ message, isSubmitting: false });
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  addComment(that, annotated, annotated_id, annotated_type, comment) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(formatMessage(messages.annotationAdded, {type: formatMessage(messages.typeComment)})) };

    const annotator = that.getContext().currentUser;

    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotator,
        annotated,
        context: that.getContext(),
        annotation: {
          text: comment,
          annotated_type,
          annotated_id,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  addTag(that, annotated, annotated_id, annotated_type, tags) {
    const tagsList = [...new Set(tags.split(','))];

    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(formatMessage(messages.annotationAdded, {type: formatMessage(messages.typeTag)})) };

    const annotator = that.getContext().currentUser;

    const context = that.getContext();

    tagsList.map((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated,
          annotator,
          parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type,
            annotated_id,
          },
        }),
        { onSuccess, onFailure },
      );
    });
  }

  addStatus(that, annotated, annotated_id, annotated_type, status) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(formatMessage(messages.annotationAdded, {type: formatMessage(messages.typeStatus)})) };

    const annotator = that.getContext().currentUser;

    let status_id = '';
    if (annotated.last_status_obj !== null) {
      status_id = annotated.last_status_obj.id;
    }
    let status_attr = {
        parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotated,
        annotator,
        context: that.getContext(),
        annotation: {
          status,
          annotated_type,
          annotated_id,
          status_id: status_id,
        },
      };
    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(
        new UpdateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    } else {
      Relay.Store.commitUpdate(
        new CreateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    }

  }

  addFlag(that, annotated, annotated_id, annotated_type, flag) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(formatMessage(messages.annotationAdded, {type: formatMessage(messages.typeFlag)})) };

    const annotator = that.getContext().currentUser;

    Relay.Store.commitUpdate(
      new CreateFlagMutation({
        parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotated,
        annotator,
        context: that.getContext(),
        annotation: {
          flag,
          annotated_type,
          annotated_id,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    const command = this.parseCommand(document.forms.addannotation.cmd.value);
    if (this.state.isSubmitting) { return e.preventDefault(); }

    this.setState({ isSubmitting: true });
    let action = null;

    if (this.props.types && this.props.types.indexOf(command.type) == -1) {
      this.failure();
    } else {
      switch (command.type) {
      case 'comment':
        action = this.addComment.bind(this);
        break;
      case 'tag':
        action = this.addTag.bind(this);
        break;
      case 'status':
        action = this.addStatus.bind(this);
        break;
      case 'flag':
        action = this.addFlag.bind(this);
        break;
      }

      if (action) {
        const annotated = this.props.annotated;
        const annotated_id = annotated.dbid;
        const annotated_type = this.props.annotatedType;
        action(this, annotated, annotated_id, annotated_type, command.args);
      } else {
        this.failure();
      }
    }

    e.preventDefault();
  }

  componentDidMount() {
    // this.annotationInput.focus();
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  render() {
    return (
      <form className="add-annotation" name="addannotation" onSubmit={this.handleSubmit.bind(this)}>
        <TextField
          hintText={this.props.intl.formatMessage(messages.inputHint)}
          fullWidth={false}
          style={{ width: '100%' }}
          errorStyle={styles.errorStyle}
          onFocus={this.handleFocus.bind(this)}
          ref={ref => this.cmd = ref}
          errorText={this.state.message}
          name="cmd" id="cmd-input"
          multiLine
          onKeyPress={this.handleKeyPress.bind(this)}
          ref={input => this.annotationInput = input}
        />
        <FlatButton label={this.props.intl.formatMessage(messages.submitButton)} primary type="submit" style={{ float: 'right' }} />
      </form>
    );
  }
}

AddAnnotation.propTypes = {
  intl:intlShape.isRequired
};

AddAnnotation.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(AddAnnotation);
