import React, { Component, PropTypes } from 'react';
import { LocationField } from './field_types';

class DynamicAnnotation extends Component {
  fieldTypeToComponent(value, type) {
    switch (type) {
    case 'location':
      return <LocationField coordinates={value} />;
    case 'text_field':
      return <p>{value}</p>;
    default:
      return <span>{value}</span>;
    }
  }

  render() {
    const { annotation } = this.props;
    return (
      <div>
        {annotation.fields.map(field => this.fieldTypeToComponent(field.value, field.field_type))}
      </div>
    );
  }
}

export default DynamicAnnotation;
