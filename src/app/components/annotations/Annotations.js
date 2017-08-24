import React, { Component, PropTypes } from 'react';
import AddAnnotation from './AddAnnotation';
import MediaAnnotation from './MediaAnnotation';
import SourceAnnotation from './SourceAnnotation';
import Can, { can } from '../Can';
import ContentColumn from '../layout/ContentColumn';

class Annotations extends Component {
  annotationComponent(node, annotated, annotatedType) {
    return <MediaAnnotation annotation={node} annotated={annotated} annotatedType={annotatedType} /> ;
  }

  render() {
    const props = this.props;
    const annotations = props.annotations;

    return (
      <div className="annotations">
        <ContentColumn>
          <ul className="annotations__list annotations-list">
            {annotations.map(annotation => (
              <li key={annotation.node.dbid} className="annotations__list-item">{this.annotationComponent(annotation.node, props.annotated, props.annotatedType)}</li>
            ))}
          </ul>
        </ContentColumn>
        {props.annotatedType === 'ProjectMedia' ? ( // TODO: remove to support Source as well
          <Can permissions={props.annotated.permissions} permission="create Comment">
            <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />
          </Can>
        ) : <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />}
      </div>
    );
  }
}

export default Annotations;
