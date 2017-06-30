import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import MediaUtil from '../media/MediaUtil';
import ParsedText from '../ParsedText';
import { Link } from 'react-router';

class SourceCard extends React.Component {
  render() {
    console.log('this.props.source');
    console.log(this.props.source);
    const { source, team, project_id, source_id } = this.props.source;
    const url = `/${team.slug}/project/${project_id}/source/${source_id}`;

    return (
      <Card className="source-card">
        <CardText>
          <CardHeader avatar={source.image}></CardHeader>
          <article>
            <div className="source-card__heading">Check Source</div>

            <div className="source-card__name">
              <Link to={url} className="header__app-link">{ source.name }</Link>
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
