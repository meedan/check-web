import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import TimelineHeader from './TimelineHeader';
import AddAnnotation from './AddAnnotation';
import MediaAnnotation from './MediaAnnotation';
import Can from '../Can';
import { units, black16, white } from '../../styles/js/variables';

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

const StyledAnnotationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  .annotations__list {
    height: calc(100vh - 350px);
    overflow-y: scroll;
    display: flex;
    // Scroll the log to the bottom
    flex-direction: column-reverse;
    border-top: 1px solid ${black16};
    border-bottom: 1px solid ${black16};

    .annotations__list-item {
      margin: 0 ${units(1)};
      &:first-of-type {
        padding-bottom: ${units(6)};
      }
      &:last-of-type {
        margin-top: ${units(6)};
      }
    }
  }
`;

const StyledAnnotationCardActions = styled(CardActions)`
  margin-top: auto;
  background-color: ${white};
`;

class Annotations extends Component {
  annotationComponent(node, annotated, annotatedType) {
    return (
      <MediaAnnotation
        annotation={node}
        annotated={annotated}
        annotatedType={annotatedType}
      />
    );
  }

  render() {
    const props = this.props;
    const annotations = props.annotations;

    return (
      <StyledAnnotationCard className="annotations">
        <TimelineHeader msgObj={messages} msgKey="timelineTitle" />
        <div className="annotations__list">
          {annotations.reverse().map(annotation =>
            <div
              key={annotation.node.dbid}
              className="annotations__list-item"
            >
              {this.annotationComponent(
                annotation.node,
                props.annotated,
                props.annotatedType,
              )}
            </div>,
          )}
        </div>
        <StyledAnnotationCardActions>
          {props.annotatedType === 'ProjectMedia'
            ? <Can
              permissions={props.annotated.permissions}
              permission="create Comment"
            >
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
        </StyledAnnotationCardActions>
      </StyledAnnotationCard>
    );
  }
}

export default Annotations;
