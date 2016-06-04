import React, { Component, PropTypes } from 'react';
import Select from 'react-select';

class KeeferSelect extends Component {
  componentDidMount() {
    this.getSavedValue();
  }

  getSavedValue() {
    var that   = this,
        field  = this.name,
        select = document.getElementById(field).getElementsByClassName('Select-placeholder')[0];
    window.storage.get(field, function(value) {
      if (value != '' && value != undefined) {
        document.forms[0][field].value = value;
        var text   = '',
            values = that.options;
        for (var i = 0; i < values.length; i++) {
          if (values[i].value.toString() == value.toString()) {
            text = values[i].label;
          }
        }
        select.innerHTML = text;
      }
    });
  }

  changed(val) {
    window.storage.set(this.name, val);
  }

  render() {
    var options = this.options = [],
        objects = this.props.objects,
        name    = this.name = this.props.name,
        title   = name.charAt(0).toUpperCase() + name.slice(1);

    for (var i = 0; i < objects.length; i++) {
      options.push({ value: objects[i].id, label: objects[i].title });
    }

    return (
      <div id={name} className={'select-' + name}>
        <label for={name}>{title}</label>
        <Select
           name={name}
           value=""
           className="dropdown"
           id={'select-' + name}
           onChange={this.changed.bind(this)}
           options={options}
           multi={this.props.multi || false}
           placeholder="Choose..."
        />
      </div>
    );
  }
}

export default KeeferSelect;
