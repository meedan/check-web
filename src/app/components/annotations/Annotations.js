import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import MediasLoading from '../media/MediasLoading';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import { units, borderWidthMedium } from '../../styles/js/shared';
import styles from '../media/media.module.css';

const StyledAnnotations = styled.div`
  border: solid 3px blue;
  display: flex;
  flex-direction: column;
  .annotations__list {
    display: flex;
    flex-direction: column;

    .annotations__list-item {
      position: relative;

      .request-card {
        border-bottom: solid 1px var(--grayBorderMain);
      }

      ${prop => prop.noLink ? null : `
        // The timeline line
        &::before {
          background-color: var(--grayBorderMain);
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
        `}
    }

    .annotations__list-item:last-of-type {
      .request-card {
        border-bottom: 0;
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
            <div className={styles['empty-list']}>
              { props.noActivityMessage || <FormattedMessage tagName="p" id="annotation.noAnnotationsYet" defaultMessage="No activity" description="Empty message for no activity in this type of annotation list" />}
            </div> :
            props.annotations.slice(0).reverse().map(annotation => (
              <div key={annotation.node.dbid} className="annotations__list-item">
                { props.component ?
                  <props.component
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                    annotation={annotation.node}
                    team={props.team}
                  /> :
                  <Annotation
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                    annotation={annotation.node}
                    team={props.team}
                  />
                }
              </div>))}
          { hasMore ? (
            <ButtonMain
              variant="contained"
              theme="lightText"
              size="default"
              onClick={this.loadMore}
              disabled={this.state.loadingMore}
              iconCenter={
                this.state.loadingMore ?
                  <MediasLoading size="icon" theme="white" variant="icon" /> :
                  null
              }
              label={
                <FormattedMessage
                  id="annotations.loadMore"
                  defaultMessage="Load more"
                  description="Button label to fetch additional annotations in this list"
                />
              }
            />
          ) : null }
        </div>
      </StyledAnnotations>
    );
  }
}

Annotations.propTypes = {
  noLink: PropTypes.bool,
  annotations: PropTypes.array,
  annotated: PropTypes.object.isRequired,
  annotatedType: PropTypes.string.isRequired,
  relay: PropTypes.object,
  noActivityMessage: PropTypes.node,
};

Annotations.defaultProps = {
  noLink: false,
  annotations: [],
  relay: null,
  noActivityMessage: null,
};

export default injectIntl(Annotations);
