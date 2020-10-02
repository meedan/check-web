import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import BlankState from '../layout/BlankState';
import { units, opaqueBlack16, borderWidthMedium } from '../../styles/js/shared';

const StyledAnnotations = styled.div`
  display: flex;
  flex-direction: column;
  .annotations__list {
    ${props => props.showAddAnnotation ?
    'height: calc(100vh - 268px);' :
    'height: calc(100vh - 200px);'
}
    overflow: auto;
    display: flex;
    flex-direction: column;
  
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

const pageSize = 10;

class Annotations extends React.Component {
  state = {
    loadingMore: false,
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.setState({ loadingMore: true }, () => {
        const newSize = this.props.annotations.length + pageSize;
        this.props.relay.setVariables(
          { pageSize: newSize },
          (state) => {
            if (state.done || state.aborted) {
              this.setState({ loadingMore: false });
            }
          },
        );
      });
    }
  };

  render() {
    const { props } = this;
    return (
      <StyledAnnotations
        className="annotations"
        showAddAnnotation={props.showAddAnnotation}
      >
        { props.showAddAnnotation ?
          <AddAnnotation
            annotated={props.annotated}
            annotatedType={props.annotatedType}
            types={props.types}
          /> : null }
        <div className="annotations__list">
          {!props.annotations.length ?
            <Box m="auto">
              <BlankState>
                { props.noActivityMessage || <FormattedMessage id="annotation.noAnnotationsYet" defaultMessage="No activity" />}
              </BlankState>
            </Box> :
            props.annotations.slice(0).reverse().map(annotation => (
              <div key={annotation.node.dbid} className="annotations__list-item">
                <Annotation
                  annotated={props.annotated}
                  annotatedType={props.annotatedType}
                  annotation={annotation.node}
                  onTimelineCommentOpen={props.onTimelineCommentOpen}
                />
              </div>))}
          { props.annotations.length < props.annotationsCount ? (
            <Button
              onClick={this.loadMore}
              disabled={this.state.loadingMore}
            >
              Load More
            </Button>
          ) : null }
        </div>
      </StyledAnnotations>);
  }
}

export default injectIntl(Annotations);
