import React from 'react';
import { LocationField } from './field_types/LocationField';

const DynamicAnnotation = (props) => {
  const fieldTypeToComponent = (value, type) => {
    let component = null;
    switch (type) {
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
  };

  return (
    <div>
      {props.annotation.fields.map(field => fieldTypeToComponent(field.value, field.field_type))}
    </div>
  );
};

export default DynamicAnnotation;
