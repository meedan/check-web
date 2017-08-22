import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardActions } from 'material-ui/Card';
import TimelineHeader from './TimelineHeader';
import AddAnnotation from './AddAnnotation';
import MediaAnnotation from './MediaAnnotation';
import SourceAnnotation from './SourceAnnotation';
import Can from '../Can';
import { black16, white } from '../../styles/js/variables.js';

const messages = defineMessages({
  timelineTitle: {
    id: 'mediaComponent.verificationTimeline',
    defaultMessage: 'Verification Timeline',
  },
  bridge_timelineTitle: {
    id: 'bridge.mediaComponent.verificationTimeline',
    defaultMessage: 'Translation Timeline',
  },
});

class Annotations extends Component {
  annotationComponent(node, annotated, annotatedType) {
    return annotatedType === 'ProjectMedia'
      ? <MediaAnnotation annotation={node} annotated={annotated} annotatedType={annotatedType} />
      : <SourceAnnotation annotation={node} annotated={annotated} annotatedType={annotatedType} />;
  }

  render() {
    const props = this.props;
    const annotations = props.annotations;

    return (
      <Card className="annotations" style="display: 'flex', flexDirection: 'column'">
        <TimelineHeader msgObj={messages} msgKey="timelineTitle" />
        <ul className="annotations__list annotations-list">
          {annotations.map(annotation =>
            <li key={annotation.node.dbid} className="annotations__list-item">
              {this.annotationComponent(annotation.node, props.annotated, props.annotatedType)}
            </li>,
          )}
        </ul>
        <CardActions style={{ marginTop: 'auto', backgroundColor: white, borderTop: `1px solid ${black16}` }}>
          {props.annotatedType === 'ProjectMedia'
              ? <Can permissions={props.annotated.permissions} permission="create Comment">
                <AddAnnotation
                  annotated={props.annotated}
                  annotatedType={props.annotatedType}
                  types={props.types}
                />
              </Can>
              : <AddAnnotation
                annotated={props.annotated}
                annotatedType={props.annotatedType}
                types={props.types}
              />}
        </CardActions>
      </Card>
    );
  }
}

export default Annotations;
