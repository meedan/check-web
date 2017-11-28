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
import styled from 'styled-components';
import ParsedText from '../ParsedText';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import { rtlClass } from '../../helpers';
import { units, Row, black54 } from '../../styles/js/shared';

const styles = {
  translationCard: {
    zIndex: 'auto',
    position: 'relative',
    borderRadius: '0',
  },
  cardText: {
    paddingBottom: '0',
  },
};

const StyledTranslationText = styled.div`
  margin-top: ${units(1)};
  margin-bottom: ${units(1)};

  ${props =>
    props.localeIsRtl
      ? `direction: rtl; text-align: right; margin-left: ${units(3)};`
      : `direction: ltr; text-align: left; margin-right: ${units(3)};`}
`;

const StyledNote = styled.p`
  display: ${props => (props.note ? 'block' : 'none')};
  text-align: ${props => (props.localeIsRtl ? 'right' : 'left')};
  color: ${black54};
  margin-top: ${units(3)};
`;

const messages = defineMessages({
  language: {
    id: 'mediaTags.language',
    defaultMessage: 'language: {language}',
  },
});

class TranslationItem extends Component {
  static getTranslationText(content) {
    const object = content.find(it => it.field_name === 'translation_text');
    return object ? object.value : '';
  }

  static getTranslationNote(content) {
    const object = content.find(it => it.field_name === 'translation_note');
    return object ? object.value : '';
  }

  static getTranslationLanguage(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.formatted_value : '';
  }

  static getTranslationLanguageCode(content) {
    const object = content.find(it => it.field_name === 'translation_language');
    return object ? object.value : '';
  }

  static bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

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
      } catch (e) {
        // Do nothing.
      }
      this.setState({ message });
    };

    const onSuccess = () => {
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
          parent_type: 'project_media',
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
        <Card className="translation__card" style={styles.translationCard}>
          <CardText className="translation__card-text" style={styles.cardText}>

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
                <div style={{ textAlign: this.props.localeIsRtl ? 'left' : 'right' }}>
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
                <StyledTranslationText
                  localeIsRtl={this.props.localeIsRtl}
                  className={`${rtlClass(language_code)}`}
                >
                  <ParsedText text={text} />
                </StyledTranslationText>
                <StyledNote localeIsRtl={this.props.localeIsRtl} note>
                  <ParsedText text={note} />
                </StyledNote>
              </div>}
            <Row style={{ justifyContent: 'space-between' }}>
              <span className="media-tags__tag">
                {this.props.intl.formatMessage(messages.language, { language })}
              </span>
              <IconMenu
                className="task-actions"
                iconButtonElement={
                  <IconButton className="task-actions__icon"><IconMoreHoriz /></IconButton>
                }
              >
                <MenuItem
                  className="task-actions__edit-translation"
                  onClick={this.handleEdit.bind(this)}
                >
                  <FormattedMessage id="translation.edit" defaultMessage="Edit translation" />
                </MenuItem>
              </IconMenu>
            </Row>
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
