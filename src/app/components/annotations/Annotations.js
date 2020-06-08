import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import styled from 'styled-components';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import { units, black16, black38, opaqueBlack16, borderWidthMedium, Text } from '../../styles/js/shared';

const StyledAnnotations = styled.div`
  display: flex;
  flex-direction: column;
  .annotations__list {
    ${props => props.showAddAnnotation ?
    'height: calc(100vh - 260px);' :
    'height: calc(100vh - 160px);'
}
    overflow: auto;
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${black16};
    border-bottom: 1px solid ${black16};

    .annotations__list-item {
      position: relative;
      margin: 0 ${units(1)};
      // The timeline line
      &::before {
        background-color: ${opaqueBlack16};
        content: '';
        display: block;
        position: absolute;
        bottom: 0;
        top: 0;
        width: ${borderWidthMedium};
        ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(4)};
      }
      &:last-of-type {
        height: 100%;
      }
    }
  }
`;

const StyledAnnotationCardActions = styled(CardActions)`
  margin-top: auto;
`;

class Annotations extends React.Component {
  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    const container = document.getElementsByClassName('annotations__list');
    if (container && container.length > 0) {
      container[0].scrollTop = container[0].scrollHeight;
    }
  };

  render() {
    const { props } = this;
    return (
      <StyledAnnotations
        className="annotations"
        showAddAnnotation={props.showAddAnnotation}
        annotationCount={props.annotations.length}
      >
        <Card style={props.style}>
          <div className="annotations__list">
            {!props.annotations.length ?
              <Text style={{ margin: 'auto', color: black38 }}>
                { props.noActivityMessage ? props.noActivityMessage : <FormattedMessage id="annotation.noAnnotationsYet" defaultMessage="No activity" /> }
              </Text> :
              props.annotations.map(annotation => (
                <div key={annotation.node.dbid} className="annotations__list-item">
                  <Annotation
                    annotation={annotation.node}
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                  />
                </div>))}
          </div>
          <StyledAnnotationCardActions>
            { props.showAddAnnotation ?
              <AddAnnotation
                annotated={props.annotated}
                annotatedType={props.annotatedType}
                types={props.types}
              /> : null }
          </StyledAnnotationCardActions>
        </Card>
      </StyledAnnotations>);
  }
}

export default injectIntl(Annotations);
