import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import MediasLoading from '../media/MediasLoading';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddAnnotation from './AddAnnotation';
import Annotation from './Annotation';
import styles from '../media/media.module.css';

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
      <div
        className="annotations"
        noLink={props.noLink}
        noLastItemStretch={hasMore}
      >
        { props.showAddAnnotation &&
          <AddAnnotation
            annotated={props.annotated}
            annotatedType={props.annotatedType}
            types={props.types}
          />
        }

        {!props.annotations.length ?
          <div className={cx('annotations__list', styles['empty-list'])}>
            { props.noActivityMessage || <FormattedMessage tagName="p" id="annotation.noAnnotationsYet" defaultMessage="No activity" description="Empty message for no activity in this type of annotation list" />}
          </div> :
          <div className={cx('annotations__list', styles['media-list'])}>
            { props.annotations.slice(0).reverse().map(annotation => (
              <div
                key={annotation.node.dbid}
                className={cx(
                  'annotations__list-item',
                  styles['media-list-item'],
                  {
                    [styles['media-timeline-item']]: !props.noLink,
                  })
                }
              >
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
              </div>
            ))}
          </div>
        }
        { hasMore ? (
          <div className={styles['media-list-actions']}>
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
          </div>
        ) : null }
      </div>
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
