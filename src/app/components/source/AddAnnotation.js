import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TextField from 'material-ui/lib/text-field'; 
import Colors from 'material-ui/lib/styles/colors';
import CreateCommentMutation from '../../relay/CreateCommentMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';

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
    let matches = input.match(/^\/(comment|tag) (.*)/);
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

  success() {
    this.setState({ message: 'Your annotation was added!' });
    var field = document.forms.addannotation.cmd;
    field.value = '';
    field.blur();
  }

  addComment(annotated, annotated_id, annotated_type, comment) {
    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        annotated: annotated,
        annotation: {
          text: comment,
          annotated_type: annotated_type,
          annotated_id: annotated_id
        }
      })
    );
  }

  addTag(annotated, annotated_id, annotated_type, tags) {
    var tagsList = tags.split(',');
    tagsList.map(function(tag) {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: annotated,
          annotation: {
            tag: tag.trim(),
            annotated_type: annotated_type,
            annotated_id: annotated_id
          }
        })
      );
    });
  }

  handleFocus() {
    this.setState({ message: null });
  }

  submit(e) {
    const command = this.parseCommand(document.forms.addannotation.cmd.value);
    let action = null;

    switch (command.type) {
      case 'comment':
        action = this.addComment;
        break;
      case 'tag':
        action = this.addTag;
        break;
    }

    if (action) {
      const annotated = this.props.annotated;
      const annotated_id = annotated.dbid;
      const annotated_type = this.props.annotatedType;
      action(annotated, annotated_id, annotated_type, command.args);
      this.success();
    }
    else {
      this.failure();
    }

    e.preventDefault();
  }

  render() {
    return (
      <form name="addannotation" onSubmit={this.submit.bind(this)}>
        <TextField hintText="Type your command here, e.g.: /command arguments" fullWidth={true} errorStyle={styles.errorStyle}
                   onFocus={this.handleFocus.bind(this)} ref={(ref) => this.cmd = ref} errorText={this.state.message} name="cmd"
                   className="cmd-input" />
      </form>
    );
  }
}

export default AddAnnotation;
