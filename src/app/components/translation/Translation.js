import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import SelectRelay from './LangSelect';
import TranslationItem from './TranslationItem';
import { Card, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
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
      submitDisabled: true,
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
    that.setState({ message, submitDisabled: false });
  }

  success() {
    let input = document.getElementById('translation-input');
    input.value = '';
    input.blur();

    input = document.getElementById('note-input');
    input.value = '';
    input.blur();

    this.setState({ message: this.props.intl.formatMessage(messages.translationAdded), submitDisabled: true });
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

    this.setState({ submitDisabled: true });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleChange() {
    this.canSubmit();
  }

  handleChangeTargetLanguage(lang) {
    const code = lang ? lang.value : '';
    this.setState({ code }, this.canSubmit);
  }

  canSubmit() {
    const translation = document.forms.addtranslation.translation.value.trim();
    this.setState({ submitDisabled: (translation && this.state.code ? false : true) });
  }

  handleSubmit(e) {
    if (!this.state.submitDisabled) {
      const annotated = this.props.annotated;
      const annotated_id = annotated.dbid;
      const annotated_type = this.props.annotatedType;

      const translation = document.forms.addtranslation.translation.value.trim();
      const note = document.forms.addtranslation.note.value.trim();

      const args = `translation_text=${translation}&translation_language=${this.state.code}&translation_note=${note}`;

      this.addTranslation(this, annotated, annotated_id, annotated_type, args);
    }

    e.preventDefault();
  }

  getLanguageCodesUsed(translations) {
    const languages = translations.edges.map(tr => JSON.parse(tr.node.content).find(it => it.field_name === 'translation_language'));
    return languages.map(it => it.value);
  }

  render() {
    const {translations} = this.props.annotated;
    const codesUsed = this.getLanguageCodesUsed(translations);

    return (
      <div className="translation__component">
        {translations.edges.map(tr => <TranslationItem translation={tr.node} media={this.props.annotated} />)}
        <Card className="translation__card">
          <CardText className="translation__card-text">
            <div className="translation__card-title"><FormattedMessage id="translation.title" defaultMessage="Add a translation" /></div>
            <SelectRelay onChange={this.handleChangeTargetLanguage.bind(this)} codesUsed={codesUsed} />
            <form className="add-translation" name="addtranslation" onSubmit={this.handleSubmit.bind(this)}>
              <TextField
                hintText={this.props.intl.formatMessage(messages.inputHint)}
                errorText={this.state.message}
                errorStyle={styles.errorStyle}
                name="translation" id="translation-input"
                multiLine
                fullWidth
                onChange={this.handleChange.bind(this)}
                onFocus={this.handleFocus.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
              />
              <TextField
                hintText={<FormattedMessage id="translation.noteLabel" defaultMessage="Note any additional details here." />}
                name="note" id="note-input"
                onKeyPress={this.handleKeyPress.bind(this)}
                onChange={this.handleChange.bind(this)}
                fullWidth
                multiLine
              />
            </form>
          </CardText>
          <CardActions className="translation__card-actions">
            <FlatButton label={<FormattedMessage id="translation.submit" defaultMessage="Submit" />} primary onClick={this.handleSubmit.bind(this)} disabled={this.state.submitDisabled} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

Translation.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Translation);
