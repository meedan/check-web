import React, { Component, PropTypes } from 'react';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import Divider from 'material-ui/lib/divider';
import TimeAgo from 'react-timeago';
import FlatButton from 'material-ui/lib/flat-button';
import { Link } from 'react-router';
 
class Medias extends Component {
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
            <li>
              <Card>
                <CardHeader title={<a href={media.url} target="_blank">{media.url}</a>} 
                            subtitle={<TimeAgo date={media.created_at} live={false} />} 
                            avatar={data.favicon} className="media-card" />
                <CardText>{data.description}</CardText>
                <Divider />
                <CardActions>
                  <Link to={'/media/' + media.dbid}><FlatButton label="View" className="view-media" /></Link>
                </CardActions>
              </Card>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }
}

export default Medias;
