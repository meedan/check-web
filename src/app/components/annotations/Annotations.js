import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import ReactChatView from 'react-chatview';
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

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const StyledCardActions = styled(CardActions)`
  margin-top: auto;
  background-color: ${white};
  border-top: 1px solid ${black16};
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
      <StyledCard className="annotations">
        <TimelineHeader msgObj={messages} msgKey="timelineTitle" />
        <ReactChatView
          className="annotations__list annotations-list"
          flipped
          reversed
          scrollLoadThreshold={50}
          onInfiniteLoad={() => true}
        >
          {annotations.map(annotation =>
            <div
              style={{ margin: `0 ${units(1)}` }}
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
        </ReactChatView>
        <StyledCardActions>
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
        </StyledCardActions>
      </StyledCard>
    );
  }
}

export default Annotations;
