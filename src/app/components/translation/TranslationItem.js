import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import IconButton from '@material-ui/core/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import ParsedText from '../ParsedText';
import UpdateDynamicMutation from '../../relay/mutations/UpdateDynamicMutation';
import { rtlClass, getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
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
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
      editing: false,
    };
  }

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

  handleSubmitUpdate(e) {
    const { translation } = this.props;

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({ message: null, editing: false });
    };

    const form = document.forms.translation_edit;
    const fields = {
      translation_text: form.translation_text ? form.translation_text.value : '',
      translation_note: form.translation_note ? form.translation_note.value : '',
    };

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
    const text = TranslationItem.getTranslationText(content);
    const note = TranslationItem.getTranslationNote(content);
    const language = TranslationItem.getTranslationLanguage(content);
    const language_code = TranslationItem.getTranslationLanguageCode(content);

    return (
      <div className="translation__component">
        <Card className="translation__card" style={styles.translationCard}>
          <CardContent className="translation__card-text" style={styles.cardText}>

            {this.state.editing ?
              <div>
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
                    errorText={this.state.message}
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
                  <Button onClick={() => this.setState({ editing: false })}>
                    <FormattedMessage id="translation.cancelEdit" defaultMessage="Cancel" />
                  </Button>
                  <Button
                    className="task__submit"
                    color="primary"
                    onClick={this.handleSubmitUpdate.bind(this)}
                    disabled={this.state.submitDisabled}
                  >
                    <FormattedMessage id="translation.submit" defaultMessage="Submit" />
                  </Button>
                </div>
              </div>
              :
              <div>
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
                  <IconButton className="task-actions__icon"><MoreHoriz /></IconButton>
                }
              >
                <MenuItem
                  className="task-actions__edit-translation"
                  onClick={this.handleEdit.bind(this)}
                >
                  <ListItemText
                    primary={
                      <FormattedMessage id="translation.edit" defaultMessage="Edit translation" />
                    }
                  />
                </MenuItem>
              </IconMenu>
            </Row>
          </CardContent>
        </Card>
      </div>
    );
  }
}

TranslationItem.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TranslationItem);
