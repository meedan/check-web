import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/lib/text-field';
import Colors from 'material-ui/lib/styles/colors';
import CreateCommentMutation from '../../relay/CreateCommentMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import CreateFlagMutation from '../../relay/CreateFlagMutation';

const styles = {
  errorStyle: {
    color: Colors.orange500,
  }
};

class AddAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = { message: null };
  }

  parseCommand(input) {
    let matches = input.match(/^\/(comment|tag|status|flag) (.*)/);
    let command = { type: 'unk', args: null };
    if (matches !== null) {
      command.type = matches[1];
      command.args = matches[2];
    }
    return command;
  }

  failure() {
    this.setState({ message: 'Invalid command' });
  }

  success(annotation_type) {
    this.setState({ message: 'Your ' + annotation_type + ' was added!' });
    var field = document.forms.addannotation.cmd;
    field.value = '';
    field.blur();
  }

  fail(transaction) {
    var that = this;
    transaction.getError().json().then(function(json) {
      var message = 'Sorry, could not create the tag';
      if (json.error) {
        message = json.error;
      }
      that.setState({ message: message });
    });
  }

  addComment(that, annotated, annotated_id, annotated_type, comment) {
    var onFailure = (transaction) => { that.fail(transaction); };

    var onSuccess = (response) => { that.success('comment'); };

    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        parent_type: annotated_type.toLowerCase(),
        annotated: annotated,
        annotation: {
          text: comment,
          annotated_type: annotated_type,
          annotated_id: annotated_id
        }
      }),
      { onSuccess, onFailure }
    );
  }

  addTag(that, annotated, annotated_id, annotated_type, tags) {
    var tagsList = [ ...new Set(tags.split(',')) ];

    var onFailure = (transaction) => { that.fail(transaction); };

    var onSuccess = (response) => { that.success('tag'); };

    tagsList.map(function(tag) {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: annotated,
          parent_type: annotated_type.toLowerCase(),
          annotation: {
            tag: tag.trim(),
            annotated_type: annotated_type,
            annotated_id: annotated_id
          }
        }),
        { onSuccess, onFailure }
      );
    });
  }

  addStatus(that, annotated, annotated_id, annotated_type, status) {
    var onFailure = (transaction) => { that.fail(transaction); };

    var onSuccess = (response) => { that.success('status'); };

    Relay.Store.commitUpdate(
      new CreateStatusMutation({
        parent_type: annotated_type.toLowerCase(),
        annotated: annotated,
        annotation: {
          status: status,
          annotated_type: annotated_type,
          annotated_id: annotated_id
        }
      }),
      { onSuccess, onFailure }
    );
  }

  addFlag(that, annotated, annotated_id, annotated_type, flag) {
    var onFailure = (transaction) => { that.fail(transaction); };

    var onSuccess = (response) => { that.success('flag'); };

    Relay.Store.commitUpdate(
      new CreateFlagMutation({
        parent_type: annotated_type.toLowerCase(),
        annotated: annotated,
        annotation: {
          flag: flag,
          annotated_type: annotated_type,
          annotated_id: annotated_id
        }
      }),
      { onSuccess, onFailure }
    );
  }

  handleFocus() {
    this.setState({ message: null });
  }

  submit(e) {
    const command = this.parseCommand(document.forms.addannotation.cmd.value);
    let action = null;

    if (this.props.types && this.props.types.indexOf(command.type) == -1) {
      this.failure();
    }

    else {
      switch (command.type) {
        case 'comment':
          action = this.addComment;
          break;
        case 'tag':
          action = this.addTag;
          break;
        case 'status':
          action = this.addStatus;
          break;
        case 'flag':
          action = this.addFlag;
          break;
      }

      if (action) {
        const annotated = this.props.annotated;
        const annotated_id = annotated.dbid;
        const annotated_type = this.props.annotatedType;
        action(this, annotated, annotated_id, annotated_type, command.args);
      }
      else {
        this.failure();
      }
    }

    e.preventDefault();
  }

  render() {
    return (
      <form className='add-annotation' name="addannotation" onSubmit={this.submit.bind(this)}>
        <TextField hintText="Type /status Verified or False to verify this report... (or /comment to comment)" fullWidth={true} errorStyle={styles.errorStyle}
                   onFocus={this.handleFocus.bind(this)} ref={(ref) => this.cmd = ref} errorText={this.state.message} name="cmd"
                   className="cmd-input" />
      </form>
    );
  }
}

export default AddAnnotation;
