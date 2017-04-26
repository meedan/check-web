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
  translationAdded: {
    id: 'translation.translationAdded',
    defaultMessage: "A translation has been added!",
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

const styles = {
  errorStyle: {
    color: '#757575',
  },
};

class Translation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      isSubmitting: false
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

  success() {
    this.setState({ message: this.props.intl.formatMessage(messages.translationAdded), isSubmitting: false });
    const input = document.getElementById('translation-input');
    input.value = '';
    input.blur();
  }

  addTranslation(that, annotated, annotated_id, annotated_type, params) {
    const onFailure = (transaction) => { that.fail(transaction); };

    const onSuccess = (response) => { that.success(); };

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

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    if (this.state.isSubmitting) { return e.preventDefault(); }

    const translation = document.forms.addtranslation.translation.value.trim();

    if (translation){
      this.setState({ isSubmitting: true });

      const annotated = this.props.annotated;
      const annotated_id = annotated.dbid;
      const annotated_type = this.props.annotatedType;
      const args = `translation_text=${translation}&translation_language=`;

      this.addTranslation(this, annotated, annotated_id, annotated_type, args);
    } else {
      this.setState({message: this.props.intl.formatMessage(messages.submitBlank)});
    }

    e.preventDefault();
  }

  render() {
    return (
      <div className="translation__component">
        <Card className="translation__card">
          <CardTitle><FormattedMessage id="translation.title" defaultMessage="Add a translation" /></CardTitle>
          <CardText>
            <form className="add-translation" name="addtranslation" onSubmit={this.handleSubmit.bind(this)}>
              <TextField
                hintText={this.props.intl.formatMessage(messages.inputHint)}
                errorText={this.state.message}
                errorStyle={styles.errorStyle}
                name="translation" id="translation-input"
                multiLine
                fullWidth
                onFocus={this.handleFocus.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
              />
            </form>
            <p className="translation__resolver"><small><FormattedMessage id="translation.pressReturnToSave" defaultMessage="Press return to save your response" /></small></p>
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
