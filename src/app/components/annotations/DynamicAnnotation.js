import React, { Component, PropTypes } from 'react';
import { LocationField } from './field_types';

class DynamicAnnotation extends Component {
  fieldTypeToComponent(value, type) {
    let component = null;
    switch(type) {
      case 'location':
        component = <LocationField coordinates={value} />;
        break;
      case 'text_field':
        component = <p>{value}</p>;
        break;
      default:
        component = <span>{value}</span>;
        break;
    }
    return component;
  }

  render() {
    const { annotation } = this.props;
    const fields = JSON.parse(annotation.content);
    const that = this;
    return (
      <div>
      {fields.map(function(field) {
        return that.fieldTypeToComponent(field.value, field.field_type);
      })}
      </div>
    );
  }
}

export default DynamicAnnotation;
