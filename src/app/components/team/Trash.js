import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import CheckContext from '../../CheckContext';
import Search from '../Search';

const messages = defineMessages({
  title: {
    id: 'trash.title',
    defaultMessage: 'Trash',
  }
});

class Trash extends Component {
  componentDidMount() {
    this.setContextTeam();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  setContextTeam() {
    const context = this.getContext();
    const currentContext = this.currentContext();
    const teamSlug = this.props.params.team;

    if (!currentContext.team || currentContext.team.slug !== teamSlug) {
      context.setContextStore({ team: { slug: teamSlug } });
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const teamSlug = this.props.params.team;

    let query = this.props.params.query || '{}';
    query = JSON.parse(query);
    query.archived = 1;
    query = JSON.stringify(query);

    const title = this.props.intl.formatMessage(messages.title);

    return (
      <div>
        <Search title={title} team={teamSlug} query={query} fields={['status', 'sort', 'tags']} />
      </div>
    );
  }
}

Trash.contextTypes = {
  store: React.PropTypes.object,
};

Trash.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Trash);
