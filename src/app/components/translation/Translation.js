import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import CheckContext from '../../CheckContext';
import CreateDynamicMutation from '../../relay/CreateDynamicMutation';

const messages = defineMessages({
  inputHint: {
    id: 'translation.inputHint',
    defaultMessage: 'Please add a translation',
  },
  annotationAdded: {
    id: 'translation.annotationAdded',
    defaultMessage: 'Annotation added',
  },
});

class Translation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  addDynamic(that, annotated, annotated_id, annotated_type, params, annotation_type) {
    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(formatMessage(messages.annotationAdded, { type: annotation_type })); };

    const annotator = that.getContext().currentUser;

    // /location location_name=Salvador&location_position=-12.9016241,-38.4198075
    const fields = {};
    if (params) params.split('&').forEach((part) => {
      const pair = part.split('=');
      fields[pair[0]] = pair[1];
    });

    Relay.Store.commitUpdate(
      new CreateDynamicMutation({
        parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotator,
        annotated,
        context: that.getContext(),
        annotation: {
          fields,
          annotation_type,
          annotated_type,
          annotated_id,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleChange(e){
    const value = e.target.value.trim();

    if (value) {
      this.setState({ translation: value });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleSubmit(){
    if (this.state.translation){
      const annotated = this.props.annotated;
      const annotated_id = annotated.dbid;
      const annotated_type = this.props.annotatedType;
      const args = "translation_text=lararara&translation_language=pt";
      this.addDynamic(this, annotated, annotated_id, annotated_type, args, 'translation');
    }
  }

  render() {
    return (
      <div>
        <Card>
          <CardTitle>Translation</CardTitle>
          <CardText>
            <TextField
              hintText={this.props.intl.formatMessage(messages.inputHint)}
              errorText={this.state.message}
              name="translation" id="translation-input"
              multiLine
              fullWidth
              onKeyPress={this.handleKeyPress.bind(this)}
              onChange={this.handleChange.bind(this)}
            />
          </CardText>
        </Card>
      </div>
    );
  }
}

Translation.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Translation);
