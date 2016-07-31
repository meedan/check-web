import React, { Component, PropTypes } from 'react';
import Annotation from './Annotation';
import AddAnnotation from './AddAnnotation';
 
class Annotations extends Component {
  render() {
    const props = this.props;
    
    return (
      <div>
        <ul className="annotations-list">
        {props.annotations.map(function(annotation) {
          return (
            <li><Annotation annotation={annotation.node} annotated={props.annotated} /></li>
          );
        })}
        </ul>

        <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} />
      </div>
    );
  }
}

export default Annotations;
