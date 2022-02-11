/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import BlankState from '../layout/BlankState';
import { units, opaqueBlack16, borderWidthMedium } from '../../styles/js/shared';

const StyledAnnotations = styled.div`
  display: flex;
  flex-direction: column;
  .annotations__list {
    display: flex;
    flex-direction: column;

    .annotations__list-item {
      position: relative;
      margin: 0 ${units(1)};

      ${prop => prop.noLink ? null : `
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
          height: ${props => props.noLastItemStretch ? 'auto' : '100%'};
        }
        `
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
    const hasMore = props.annotations.length < props.annotationsCount;

    return (
      <StyledAnnotations
        className="annotations"
        showAddAnnotation={props.showAddAnnotation}
        noLink={props.noLink}
        noLastItemStretch={hasMore}
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
                { props.component ?
                  <props.component
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                    annotation={annotation.node}
                    onTimelineCommentOpen={props.onTimelineCommentOpen}
                    team={props.team}
                  /> :
                  <Annotation
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                    annotation={annotation.node}
                    onTimelineCommentOpen={props.onTimelineCommentOpen}
                    team={props.team}
                  />
                }
              </div>))}
          { hasMore ? (
            <Button
              onClick={this.loadMore}
              disabled={this.state.loadingMore}
              endIcon={
                this.state.loadingMore ?
                  <CircularProgress color="inherit" size="1em" /> :
                  null
              }
            >
              <FormattedMessage
                id="annotations.loadMore"
                defaultMessage="Load more"
              />
            </Button>
          ) : null }
        </div>
      </StyledAnnotations>);
  }
}

export default injectIntl(Annotations);
