import React from 'react';
import { LocationField } from './field_types';

const DynamicAnnotation = (props) => {
  const { annotation } = props;

  function fieldTypeToComponent(value, type) {
    switch (type) {
    case 'location':
      return <LocationField coordinates={value} />;
    case 'text_field':
      return <p>{value}</p>;
    default:
      return <span>{value}</span>;
    }
  }

  return (
    <div>
      {annotation.fields.map(field => fieldTypeToComponent(field.value, field.field_type))}
    </div>
  );
};

export default DynamicAnnotation;
