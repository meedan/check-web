/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import Annotation from './Annotation';
import Loader from '../cds/loading/Loader';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
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
    const componentProps = props.componentProps || {};

    return (
      <div className="annotations">
        {!props.annotations.length ?
          <div className={cx('annotations__list', styles['empty-list'])}>
            { props.noActivityMessage || <FormattedMessage defaultMessage="No activity" description="Empty message for no activity in this type of annotation list" id="annotation.noAnnotationsYet" tagName="p" />}
          </div> :
          <div className={cx('annotations__list', styles['media-list'])}>
            { props.annotations.slice(0).reverse().map(annotation => (
              <div
                className={cx(
                  'annotations__list-item',
                  styles['media-list-item'],
                  {
                    [styles['media-timeline-item']]: !props.noLink,
                  })
                }
                key={annotation.node.dbid}
              >
                { props.component ?
                  <props.component
                    annotated={props.annotated}
                    annotatedType={props.annotatedType}
                    annotation={annotation.node}
                    team={props.team}
                    {...componentProps}
                  />
                  :
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
              disabled={this.state.loadingMore}
              iconCenter={
                this.state.loadingMore ?
                  <Loader size="icon" theme="white" variant="icon" /> :
                  null
              }
              label={
                <FormattedMessage
                  defaultMessage="Load more"
                  description="Button label to fetch additional annotations in this list"
                  id="annotations.loadMore"
                />
              }
              size="default"
              theme="lightText"
              variant="contained"
              onClick={this.loadMore}
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
