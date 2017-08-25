import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText } from 'material-ui/Card';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import MdMoreHoriz from 'react-icons/lib/md/more-horiz';
import ParsedText from '../ParsedText';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import { rtlClass } from '../../helpers';

const messages = defineMessages({
  language: {
    id: 'mediaTags.language',
    defaultMessage: 'language: {language}',
  },
});

class TranslationItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      isMenuOpen: false,
    };
  }

  handleSubmitUpdate() {
    const translation = this.props.translation;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      this.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null, editing: false });
    };

    const form = document.forms.translation_edit;
    const fields = {};
    fields.translation_text = form.translation_text ? form.translation_text.value : '';
    fields.translation_note = form.translation_note ? form.translation_note.value : '';

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new UpdateDynamicMutation({
          annotated: this.props.media,
          dynamic: {
            id: translation.id,
            fields,
          },
        }),
        { onSuccess, onFailure },
      );
    }

    e.preventDefault();
  }

  getTranslationText(content) {
    const object = content.find(it => it.field_name === 'translation_text');
    return object ? object.value : '';
  }

  getTranslationNote(content) {
    const object = content.find(it => it.field_name === 'translation_note');
    return object ? object.value : '';
  }

  getTranslationLanguage(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.formatted_value : '';
  }

  getTranslationLanguageCode(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.value : '';
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  handleEdit() {
    this.setState({ editing: true, isMenuOpen: false });
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  render() {
    const content = JSON.parse(this.props.translation.content);
    const text = this.getTranslationText(content);
    const note = this.getTranslationNote(content);
    const language = this.getTranslationLanguage(content);
    const language_code = this.getTranslationLanguageCode(content);

    return (
      <div className="translation__component">
        <Card className="translation__card" style={{ zIndex: 'auto' }}>
          <CardText className="translation__card-text">
            <div className="task__actions">
              <MdMoreHoriz
                className="task__actions-icon media-actions__icon"
                onClick={this.toggleMenu.bind(this)}
              />
              <IconMenu
                className="media-actions"
                iconButtonElement={<IconButton><IconMoreHoriz /></IconButton>}
              >
                <MenuItem
                  className="media-actions__edit-translation"
                  onClick={this.handleEdit.bind(this)}
                >
                  <FormattedMessage id="translation.edit" defaultMessage="Edit translation" />
                </MenuItem>
              </IconMenu>
            </div>
            {this.state.editing
              ? <div>
                <form name="translation_edit">
                  <TextField
                    name="translation_text"
                    hintText={
                      <FormattedMessage
                        id="translation.translationText"
                        defaultMessage="Translation text"
                      />
                      }
                    defaultValue={text}
                    fullWidth
                    multiLine
                  />
                  <TextField
                    name="translation_note"
                    hintText={
                      <FormattedMessage id="translation.translationNote" defaultMessage="Note" />
                      }
                    defaultValue={note}
                    fullWidth
                    multiLine
                  />
                </form>
                <div className="translation__card-actions">
                  <FlatButton
                    label={
                      <FormattedMessage id="translation.cancelEdit" defaultMessage="Cancel" />
                      }
                    onClick={() => this.setState({ editing: false })}
                  />
                  <FlatButton
                    className="task__submit"
                    label={<FormattedMessage id="translation.submit" defaultMessage="Submit" />}
                    primary
                    onClick={this.handleSubmitUpdate.bind(this)}
                    disabled={this.state.submitDisabled}
                  />
                </div>
              </div>
              : <div>
                <div className={`translation__card-title ${rtlClass(language_code)}`}>
                  <ParsedText text={text} />
                </div>
                <p style={{ display: note ? 'block' : 'none' }} className="translation__note">
                  <ParsedText text={note} />
                </p>
              </div>}
            <span className="media-tags__tag">
              {this.props.intl.formatMessage(messages.language, { language })}
            </span>
          </CardText>
        </Card>
      </div>
    );
  }
}

TranslationItem.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TranslationItem);
