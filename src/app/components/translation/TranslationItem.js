import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Card, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CheckContext from '../../CheckContext';
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

  handleSubmitUpdate(e) {
    const that = this;
    const translation = this.props.translation;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: null, editing: false });
    };

    const form = document.forms['translation_edit'];
    const fields = {};
    fields[`translation_text`] = form.translation_text ? form.translation_text.value : '';
    fields[`translation_note`] = form.translation_note ? form.translation_note.value : '';

    console.log('fields');
    console.log(fields);

    if (!that.state.submitDisabled){
      Relay.Store.commitUpdate(
        new UpdateDynamicMutation({
          annotated: that.props.media,
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
    return object ? object.value : '' ;
  }

  getTranslationNote(content) {
    const object = content.find(it => it.field_name === 'translation_note');
    return object ? object.value : '' ;
  }

  getTranslationLanguage(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.formatted_value : '' ;
  }

  getTranslationLanguageCode(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.value : '' ;
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
    const translation = this.props.translation;
    const content = JSON.parse(translation.content);
    const text = this.getTranslationText(content);
    const note = this.getTranslationNote(content);
    const language = this.getTranslationLanguage(content);
    const language_code = this.getTranslationLanguageCode(content);


    const cardMenu = (
      <div className={`task__actions ${this.bemClass('media-actions', this.state.isMenuOpen, '--active')}`}>
        <MdMoreHoriz className="task__actions-icon / media-actions__icon" onClick={this.toggleMenu.bind(this)} />
        <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
        <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="media-actions__menu-item" onClick={this.handleEdit.bind(this)}><FormattedMessage id="translation.edit" defaultMessage="Edit translation" /></li>
        </ul>
      </div>
    );

    const cancelCallback = () => { this.setState({ editing: false }) };
    const submitCallback = this.handleSubmitUpdate.bind(this);

    const actionBtns = (<div className="translation__card-actions">
        <FlatButton label={<FormattedMessage id="translation.cancelEdit" defaultMessage="Cancel" />} onClick={cancelCallback} />
        <FlatButton className="task__submit" label={<FormattedMessage id="translation.submit" defaultMessage="Submit" />} primary onClick={submitCallback} disabled={this.state.submitDisabled}/>
      </div>);

    return (
      <div className="translation__component">
        <Card className="translation__card" style={{'zIndex': 'auto'}}>
          <CardText className="translation__card-text">
            {cardMenu}
            {this.state.editing ?
              <div>
                <form name="translation_edit">
                  <TextField
                    name="translation_text"
                    hintText={<FormattedMessage id="translation.translationText" defaultMessage="Translation text" />}
                    defaultValue={text}
                    fullWidth
                    multiLine
                  />
                  <TextField
                    name="translation_note"
                    hintText={<FormattedMessage id="translation.translationNote" defaultMessage="Note" />}
                    defaultValue={note}
                    fullWidth
                    multiLine
                  />
                </form>
                {actionBtns}
              </div>
            : [
              <div className={`translation__card-title ${rtlClass(language_code)}`}>{text}</div>,
              <p style={{ display: note ? 'block' : 'none' }} className="translation__note"><ParsedText text={note} /></p>
            ]}
            <span className="media-tags__tag">{this.props.intl.formatMessage(messages.language, { language })}</span>
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
