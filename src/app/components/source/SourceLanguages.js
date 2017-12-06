import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import { StyledTagsWrapper } from '../../styles/js/shared';

const messages = defineMessages({
  languages: {
    id: 'sourceLanguages.label',
    defaultMessage: 'Languages',
  },
  addLanguageHelper: {
    id: 'sourceLanguages.addLanguageHelper',
    defaultMessage: 'Select a language',
  },
});

class SourceLanguages extends Component {
  getAvailableLanguages() {
    const usedLanguages = this.props.usedLanguages
      .map(tr => JSON.parse(tr.node.content).find(it => it.field_name === 'language'))
      .map(it => it.value);

    const supportedLanguages = JSON.parse(this.props.about.languages_supported);

    const projectLanguages =
      this.props.projectLanguages ? JSON.parse(this.props.projectLanguages) : null;

    return difference(projectLanguages ?
        intersection(Object.keys(supportedLanguages), projectLanguages) :
        Object.keys(supportedLanguages), usedLanguages)
      .map(l => ({ value: l, label: supportedLanguages[l] }));
  }

  renderLanguages() {
    const usedLanguages = this.props.usedLanguages
      .map(tr => ({
        id: tr.node.id,
        content: JSON.parse(tr.node.content).find(it => it.field_name === 'language') }
      ));

    const supportedLanguages = JSON.parse(this.props.about.languages_supported);

    return (
      <StyledTagsWrapper className="source-tags__tags">
        {usedLanguages.map(language =>
          <Chip
            key={language.id}
            className="source-tags__tag"
            onRequestDelete={this.props.onDelete ? () => {
              this.props.onDelete(language.id);
            } : null}
          >
            {supportedLanguages[language.content.value]}
          </Chip>,
        )}
      </StyledTagsWrapper>
    );
  }

  renderLanguagesView() {
    return this.renderLanguages();
  }

  renderLanguagesEdit() {
    const selectCallback = (value) => {
      this.props.onSelect(value);

      setTimeout(() => {
        this.autoComplete.setState({ searchText: '' });
      }, 500);
    };

    return (<div>
      <AutoComplete
        id="sourceLanguageInput"
        errorText={this.props.errorText}
        filter={AutoComplete.caseInsensitiveFilter}
        floatingLabelText={this.props.intl.formatMessage(messages.languages)}
        dataSource={this.getAvailableLanguages()}
        dataSourceConfig={{ text: 'label', value: 'value' }}
        openOnFocus
        onNewRequest={selectCallback}
        ref={(a) => { this.autoComplete = a; }}
        fullWidth
        textFieldStyle={{ width: '85%' }}
      />
      <div className="source__helper">
        {this.props.intl.formatMessage(messages.addLanguageHelper)}
      </div>
      {this.renderLanguages()}
    </div>);
  }

  render() {
    return (this.props.isEditing ? this.renderLanguagesEdit() : this.renderLanguagesView());
  }
}

export default SourceLanguages;
