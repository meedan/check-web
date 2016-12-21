import React, { Component, PropTypes } from 'react';
import Annotation from './Annotation';
import AddAnnotation from './AddAnnotation';
import Can, { can } from '../Can';

class Annotations extends Component {
  render() {
    const props = this.props;
    const annotations = props.annotations.filter(annotation => ['comment', 'status', 'tag', 'flag'].includes(annotation.node.annotation_type));

    return (
      <div>
        <ul className="annotations-list">
          {annotations.map(annotation => (
            <li><Annotation annotation={annotation.node} annotated={props.annotated} annotatedType={props.annotatedType} /></li>
          ))}
        </ul>

        {props.annotatedType === 'Media' ? ( // TODO: remove to support Source as well
          <Can permissions={props.annotated.permissions} permission="create Comment">
            <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />
          </Can>
        ) : <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />}
      </div>
    );
  }
}

export default Annotations;
