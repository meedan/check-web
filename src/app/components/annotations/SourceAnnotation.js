import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Lightbox from 'react-image-lightbox';
import { Card, CardText } from 'material-ui/Card';
import ProfileLink from '../layout/ProfileLink';
import MediaDetail from '../media/MediaDetail';
import MediaUtil from '../media/MediaUtil';
import DynamicAnnotation from '../annotations/DynamicAnnotation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/DeleteVersionMutation';
import Can from '../Can';
import TimeBefore from '../TimeBefore';
import { getStatus } from '../../helpers';
import ParsedText from '../ParsedText';

const messages = defineMessages({
  error: {
    id: 'annotation.error',
    defaultMessage: 'Could not delete annotation',
  },
  deleteButton: {
    id: 'annotation.deleteButton',
    defaultMessage: 'Delete',
  },
});

class Annotation extends Component {
  constructor(props) {
    super(props);

    this.state = { zoomedCommentImage: false };
  }

  handleDelete(id) {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
    };

    const onSuccess = (response) => {
    };

    // Either to destroy versions or annotations
    const destroy_attr = {
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      annotated: this.props.annotated,
      id,
    };
    if (this.props.annotation.version === null) {
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    } else {
      destroy_attr.id = this.props.annotation.version.id;
      Relay.Store.commitUpdate(
        new DeleteVersionMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    }
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }

  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  render() {
    const annotation = this.props.annotation;
    const annotated = this.props.annotated;
    const permissionType = `${annotation.annotation_type.charAt(0).toUpperCase()}${annotation.annotation_type.slice(1)}`;

    let annotationActions = (
      <div className="annotation__actions">
        <Can permissions={annotation.permissions} permission={`destroy ${permissionType}`}>
          <button className="annotation__delete" onClick={this.handleDelete.bind(this, annotation.id)} title={this.props.intl.formatMessage(messages.deleteButton)}>×</button>
        </Can>
      </div>
    );

    const updatedAt = MediaUtil.createdAt({ published: annotation.created_at });
    const timestamp = updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt}/></span> : null;
    const content = JSON.parse(annotation.content);
    let contentTemplate;

    switch (annotation.annotation_type) {
    case 'comment':
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (
        <div>
          <div className='annotation__card-content'>
            <ParsedText text={commentText} />
              {/* thumbnail */ }
              { commentContent.original ?
                <img src={commentContent.thumbnail} className='annotation__card-thumbnail' alt="" onClick={this.handleOpenCommentImage.bind(this, commentContent.original)} />
              : null }
          </div>

          {/* embedded medias */ }
          <div className="annotation__card-embedded-medias">
          {annotation.medias.edges.map(media => (
            <div><MediaDetail media={media.node} condensed readonly /></div>
          ))}
          </div>

          {/* lightbox */ }
          { (commentContent.original && !!this.state.zoomedCommentImage) ?
            <Lightbox onCloseRequest={this.handleCloseCommentImage.bind(this)} mainSrc={this.state.zoomedCommentImage} />
          : null }
        </div>
      );
      break;
    case 'tag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage
              id="annotation.taggedHeader"
              defaultMessage={'Tagged #{tag} by {author}'}
              values={{ tag: content.tag.replace(/^#/, ''), author: <span className="annotation__author-name">{annotation.annotator.name}</span> }}
            />
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'flag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage
              id="annotation.flaggedHeader"
              defaultMessage={'Flagged as {flag} by {author}'}
              values={{ flag: content.flag, author: <span className="annotation__author-name">{annotation.annotator.name}</span> }}
            />
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    default:
      annotationActions = (
        <div className="annotation__actions">
          <Can permissions={annotation.permissions} permission="destroy Dynamic">
            <button className="annotation__delete" onClick={this.handleDelete.bind(this, annotation.id)} title="Delete">×</button>
          </Can>
        </div>
      );
      const fields = JSON.parse(annotation.content);
      if (fields.constructor === Array) {
        annotation.fields = fields;
        contentTemplate = (
          <section className="annotation__content">
            <div className="annotation__header">
              <h4 className="annotation__author-name">{annotation.annotator.name}</h4>
              {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
              {annotationActions}
            </div>
            <div className="annotation__body">
              <DynamicAnnotation annotation={annotation} />
            </div>
          </section>
        );
      } else {
        contentTemplate = null;
      }
      break;
    }

    const useCardTemplate = (annotation.annotation_type === 'comment');
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';

    return (
      <section className={`annotation ${templateClass} ${typeClass}`} id={`annotation-${annotation.dbid}`}>
        {useCardTemplate ? (
            <Card className='annotation__card'>
              <CardText className='annotation__card-text'>
                <div className='annotation__card-avatar-col'>
                  <div className='annotation__card-avatar' style={{ backgroundImage: `url(${annotation.annotator.profile_image})` }} />
                </div>
                <div className='annotation__card-main-col'>
                  {contentTemplate}
                  <footer className='annotation__card-footer'>
                    <span className='annotation__card-footer-text'>
                      <ProfileLink user={annotation.annotator.user} className={'annotation__card-author'} /> <span>{timestamp}</span>
                    </span>
                    {annotationActions}
                  </footer>
                </div>

              </CardText>
            </Card>
          ) : (
            <div className='annotation__default'>
              <span className='annotation__default-text'>
                <span className='annotation__default-content'>{contentTemplate}</span>
                {timestamp}
              </span>
            </div>
          )
        }
      </section>
    );
  }
}

Annotation.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Annotation);
