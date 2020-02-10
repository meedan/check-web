import React from 'react';
import Relay from 'react-relay/classic';
import { injectIntl, defineMessages } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import AboutRoute from '../../relay/AboutRoute';
import { StyledTagsWrapper } from '../../styles/js/shared';
import { safelyParseJSON } from '../../helpers';

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

class LanguageComponent extends React.Component {
  getAvailableLanguages() {
    const usedLanguages = this.props.usedLanguages
      .map(tr => safelyParseJSON(tr.node.content).find(it => it.field_name === 'language'))
      .map(it => it.value);

    const supportedLanguages = safelyParseJSON(this.props.about.languages_supported);

    const teamLanguages = safelyParseJSON(this.props.teamLanguages);

    return difference(
      teamLanguages ?
        intersection(Object.keys(supportedLanguages), teamLanguages) :
        Object.keys(supportedLanguages),
      usedLanguages,
    )
      .map(l => ({ value: l, label: supportedLanguages[l] }));
  }

  renderLanguages() {
    const usedLanguages = this.props.usedLanguages
      .map(tr => ({ id: tr.node.id, content: safelyParseJSON(tr.node.content).find(it => it.field_name === 'language') }));

    const supportedLanguages = safelyParseJSON(this.props.about.languages_supported);

    return (
      <StyledTagsWrapper className="source-tags__tags">
        {usedLanguages.map(language => (
          <Chip
            key={language.id}
            className="source-tags__tag"
            onRequestDelete={this.props.onDelete ? () => {
              this.props.onDelete(language.id);
            } : null}
          >
            {supportedLanguages[language.content.value]}
          </Chip>))}
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

    return (
      <div>
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

const LanguageContainer = Relay.createContainer(injectIntl(LanguageComponent), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

const SourceLanguages = (props) => {
  const route = new AboutRoute();
  return (<Relay.RootContainer
    Component={LanguageContainer}
    route={route}
    renderFetched={data => <LanguageContainer {...props} {...data} />}
  />);
};

export default SourceLanguages;
