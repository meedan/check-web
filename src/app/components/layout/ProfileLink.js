import React from 'react';

class ProfileLink extends React.Component {
  render() {
    const { user, className } = this.props;

    if (!user) { return null };

    let url = user.email ? 'mailto:' + user.email : '';

    if (user && user.source && user.source.accounts && user.source.accounts.edges && user.source.accounts.edges.length > 0){
      url = user.source.accounts.edges[0].node.url;
    }

    return url ?
        <a target="_blank" rel="noopener noreferrer" className={className} href={url}>{user.name}</a> :
        <span className={className}>{user.name}</span>;
  }
}

export default ProfileLink;
