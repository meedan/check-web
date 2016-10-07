import React, { Component, PropTypes } from 'react';
import Annotation from './Annotation';
import AddAnnotation from './AddAnnotation';
import Can, { can } from '../Can';

class Annotations extends Component {
  render() {
    const props = this.props;
    
    return (
      <div>
        <ul className="annotations-list">
        {props.annotations.map(function(annotation) {
          return (
            <li><Annotation annotation={annotation.node} annotated={props.annotated} annotatedType={props.annotatedType} /></li>
          );
        })}
        </ul>

        <Can permissions={props.annotated.permissions} permission={`update ${props.annotatedType}`}>
          <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />
        </Can>
      </div>
    );
  }
}

export default Annotations;
