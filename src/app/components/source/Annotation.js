import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TimeAgo from 'react-timeago';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';

class Annotation extends Component {
  handleDelete(id) {
    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Could not delete annotation';
        if (json.error) {
          message = json.error;
        }
        window.alert(message);
      });
    };

    var onSuccess = (response) => {
    };

    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation({
        parent_type: this.props.annotatedType.toLowerCase(),
        annotated: this.props.annotated,
        id: id
      }),
      { onSuccess, onFailure }
    );
  }

  render() {
    const annotation = this.props.annotation;

    // Display is different, based on annotation type
    let content = JSON.parse(annotation.content);
    switch (annotation.annotation_type) {
      case 'comment':
        content = content.text;
        break;
      case 'tag':
        content = 'Tagged as "' + content.tag + '"'
        break;
      case 'status':
        content = 'Status set to "' + content.status + '"'
        break;
      case 'flag':
        content = 'Flagged as "' + content.flag + '"'
        break;
      default:
        content = annotation.content;
    }

    return (
      <div className="annotation" id={'annotation-' + annotation.dbid}>
        <div className='annotation__avatar' style={{backgroundImage: `url(${annotation.annotator.profile_image})`}}></div>
        <section className='annotation__content'>
          <div className='annotation__header'>
            <h4 className='annotation__author-name'>{annotation.annotator.name}</h4>
            <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
            <div className='annotation__actions'>
              <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
            </div>
          </div>
          <div className='annotation__body'>{content}</div>
        </section>
      </div>
    );
  }
}

export default Annotation;
