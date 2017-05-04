import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Card, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CheckContext from '../../CheckContext';
import MdMoreHoriz from 'react-icons/lib/md/more-horiz';

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

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
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

    const trActions = (
      <div className={`task__actions ${this.bemClass('media-actions', this.state.isMenuOpen, '--active')}`}>
        <MdMoreHoriz className="task__actions-icon / media-actions__icon" onClick={this.toggleMenu.bind(this)} />
        <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
        <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
          <li className="media-actions__menu-item" ><FormattedMessage id="task.edit" defaultMessage="Edit task" /></li>
          <li className="media-actions__menu-item" ><FormattedMessage id="task.delete" defaultMessage="Delete task" /></li>
        </ul>
      </div>
    );

    return (
      <div className="translation__component">
        <Card className="translation__card">
          <CardText className="translation__card-text">
            {trActions}
            <div className="translation__card-title">{text}</div>
            {note}
            <br />
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
