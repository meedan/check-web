import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import MediaUtil from '../media/MediaUtil';
import ParsedText from '../ParsedText';

class SourceCard extends React.Component {
  render() {
    const { source } = this.props.source;

    return (
      <Card className="source-card">
        <CardText>
          <CardHeader avatar={source.image}></CardHeader>
          <article>
            <div className="source-card__heading">Check Source</div>

            <div className="source-card__name">
              <a href={'#'} target="_ blank" rel="noopener noreferrer" className="social-media-card__name">{ source.name }</a>
            </div>

            <div className="source-card__description"><ParsedText text={source.description} /></div>

            <div className="source-card__accounts">
              <ul>
                { source.accounts.edges.map(account => {
                  return <li className="source-card__account-link">
                    { MediaUtil.socialIcon(account.node.provider + '.com') /*TODO: refactor */ }
                    <a href={ account.node.url } target="_blank" rel="noopener noreferrer">
                      { account.node.embed.username }
                    </a>
                  </li>
                }) }
              </ul>
            </div>
          </article>
        </CardText>
      </Card>
    );
  }
}

export default SourceCard;
