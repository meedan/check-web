import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import MediaUtil from '../media/MediaUtil';

class SourceCard extends React.Component {
  render() {
    const { source } = this.props.source;

    return (
      <Card className="source-card">
        <CardText>
          <CardHeader avatar={source.image}></CardHeader>
          <article>
            <div className="source-card__heading">Check Source</div>

            <div className="source-card__name">{source.name}</div>

            <div className="source-card__description">{source.description}</div>

            <div className="source-card__accounts">
              <ul>
                { source.accounts.edges.map(account => {
                  //const accountData = JSON.parse(account.node.data);

                  console.log('account');
                  console.log(account);

                  return <li className="source-card__account-link">
                    { MediaUtil.socialIcon('facebook.com') }
                    <a href={ account.node.url } target="_blank" rel="noopener noreferrer">
                      account.node.provider
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
