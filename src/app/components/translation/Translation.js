import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
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
  translationFailed: {
    id: 'translation.translationFailed',
    defaultMessage: 'Sorry, could not create the translation',
  },
  submitBlank: {
    id: 'translation.submitBlank',
    defaultMessage: "Can't submit a blank translation",
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

  addTranslation(that, annotated, annotated_id, annotated_type, params) {
    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.setState({ message: '' }); };

    const annotator = that.getContext().currentUser;

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
          annotation_type: 'translation',
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
      const args = `translation_text=${this.state.translation}&translation_language=`;
      this.addTranslation(this, annotated, annotated_id, annotated_type, args);
    } else {
      this.setState({message: this.props.intl.formatMessage(messages.submitBlank)});
    }
  }

  render() {
    return (
      <div className="translation__component">
        <Card className="translation__card">
          <CardTitle><FormattedMessage id="translation.title" defaultMessage="Translation" /></CardTitle>
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
