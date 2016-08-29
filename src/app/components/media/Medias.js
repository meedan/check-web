import React, { Component, PropTypes } from 'react';
import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router';
 
class Medias extends Component {
  statusToClass(status) {
    if (status === '') {
      return '';
    }
    return 'media-last-status-' + status.toLowerCase().replace(' ', '-');
  }

  render() {
    const props = this.props;
    const that = this;
    
    return (
      <div>
        <ul className="medias-list">
        {props.medias.map(function(node) {
          const media = node.node;
          media.created_at = new Date(parseInt(media.published) * 1000);
          const data = JSON.parse(media.jsondata);
          
          return (
            <li className="media-card-link">
              <Link to={'/media/' + media.dbid}>
                <Card>
                  <CardText>
                    <span className={ 'media-card-col media-last-status ' + that.statusToClass(media.last_status) }>{media.last_status}</span>
                    <div className="media-card-col">
                      <p className="media-description">{data.description}</p>
                      <ul className="media-data">
                        <li>{media.annotations_count} notes</li>
                        <li>{media.domain}</li>
                        <li>{data.username}</li>
                      </ul>
                    </div>
                  </CardText>
                </Card>
              </Link>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
}

export default Medias;
