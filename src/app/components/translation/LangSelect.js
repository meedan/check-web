import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import Select from 'react-select';
import AboutRoute from '../../relay/AboutRoute';

class LangSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: null,
    };
  }

  handleChange(value) {
    this.setState({selected: value});
    this.props.onChange(value);
  }

  isDisabled(code) {
    return (this.props.usedLanguages.findIndex(value => code === value) > -1);
  }

  render() {
    const about = this.props.about;
    const languages = JSON.parse(about.languages_supported);
    const show_languages = this.props.showLanguages ? JSON.parse(this.props.showLanguages) : null;

    let options = [];
    Object.keys(languages).forEach((key, index) => {
      if (!show_languages || (show_languages.findIndex(value => key === value) > -1)) {
        options.push({ value: key, label: languages[key], disabled: this.isDisabled(key) });
      }
    });

    return (
      <Select
        value={this.state.selected}
        options={options}
        multi={false}
        placeholder={<FormattedMessage id="langSelect.selectLanguage" defaultMessage="Select language" />}
        onChange={this.handleChange.bind(this)}
      />
    );
  }
}

const SelectContainer = Relay.createContainer(LangSelect, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

class SelectRelay extends Component {
  render() {
    const route = new AboutRoute();
    return (<Relay.RootContainer Component={SelectContainer} route={route} renderFetched={data => <SelectContainer {...this.props} {...data} />} />);
  }
}

export default SelectRelay;
