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
    return (this.props.codesUsed.findIndex(value => code === value) > -1);
  }

  render() {
    const about = this.props.about;
    const languages = JSON.parse(about.languages_supported);

    let options = [];

    Object.keys(languages).map((key, index) => {
      options.push({ value: key, label: languages[key], disabled:this.isDisabled(key) });
    });

    return (<div>
      <Select
        name="translation_language"
        value={this.state.selected}
        className="dropdown"
        id="select"
        options={options}
        multi={false}
        placeholder={<FormattedMessage id="langSelect.selectLanguage" defaultMessage="Select language" />}
        onChange={this.handleChange.bind(this)}
      />
    </div>);
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
