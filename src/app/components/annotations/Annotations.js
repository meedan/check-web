import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Card, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import { units, black16, black38, opaqueBlack16, borderWidthMedium, Text } from '../../styles/js/shared';

const StyledAnnotations = styled.div`
  display: flex;
  flex-direction: column;
  .annotations__list {
    // Chrome only hack to avoid broken scroll on Firefox :( CGB 2017-10-6
    // TODO Figure out a real solution for this
    // https://github.com/philipwalton/flexbugs/issues/108
    ${props => props.annotationCount < 4 ? 'height: 250px' :
    `@media screen and (-webkit-min-device-pixel-ratio:0) {
      max-height: ${props.height === 'short'
    ? 'calc(100vh - 580px);'
    : 'calc(100vh - 420px);'
};
    }`
};
    min-height: 250px;
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
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        top: 0;
        width: ${borderWidthMedium};
        ${props => (props.isRtl ? 'right' : 'left')}: ${units(4)};
      }
      &:first-of-type {
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
        isRtl={rtlDetect.isRtlLang(props.intl.locale)}
        height={props.height}
        annotationCount={props.annotations.length}
      >
        <Card initiallyExpanded style={props.style}>
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
