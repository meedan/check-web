import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import AboutRoute from '../relay/AboutRoute';

class LanguageSelectorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { project } = this.props;
    const supportedLanguages = JSON.parse(this.props.about.languages_supported);
    const projectLanguages = project.get_languages
      ? JSON.parse(project.get_languages)
      : null;
    return (
      <select onChange={this.props.onChange} defaultValue={this.props.selected}>
        {(projectLanguages ?
          (projectLanguages.map(code =>
            (<option key={code} value={code}>{supportedLanguages[code]}</option>))
            .concat(<option key="disabled" disabled>──────────</option>))
          : [])
          .concat(Object.keys(supportedLanguages)
            .filter(code => !projectLanguages || !projectLanguages.includes(code))
            .map(code =>
              (<option key={code} value={code}>{supportedLanguages[code]}</option>)))}
      </select>
    );
  }
}

const LanguageSelectorContainer = Relay.createContainer(LanguageSelectorComponent, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

const LanguageSelector = (props) => {
  const route = new AboutRoute();
  return (
    <Relay.RootContainer
      Component={LanguageSelectorContainer}
      route={route}
      renderFetched={data => <LanguageSelectorContainer {...props} {...data} />}
    />
  );
};

export default LanguageSelector;
