import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import IconEdit from 'material-ui/svg-icons/image/edit';
import SourceRoute from '../SourceRoute';
import Can from '../../components/Can';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';

class SourceMenu extends Component {
  handleClickEditSource() {
    const { team, projectId, sourceId } = this.props.params;
    const { history } = new CheckContext(this).getContextStore();

    history.push(`/${team}/project/${projectId}/source/${sourceId}/edit`);
  }

  render() {
    const { source } = this.props;

    const editSourceButton = (
      <SmallerStyledIconButton
        className="source-menu__edit-source-button"
        onClick={this.handleClickEditSource.bind(this)}
        tooltip={<FormattedMessage id="sourceMenuRelay.editSource" defaultMessage="Edit source" />}
      >
        <IconEdit />
      </SmallerStyledIconButton>
    );

    return (
      <Can permissions={source.permissions} permission="update ProjectSource">
        <div
          key="sourceMenuRelay.editSource"
          className="source-menu"
        >
          {editSourceButton}
        </div>
      </Can>
    );
  }
}

SourceMenu.contextTypes = {
  store: PropTypes.object,
};

const SourceMenuContainer = Relay.createContainer(SourceMenu, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id,
        dbid,
        permissions,
        source {
          id,
          dbid,
          permissions,
        }
      }
    `,
  },
});

const SourceMenuRelay = (props) => {
  const { projectId, sourceId } = props.params;
  const ids = `${sourceId},${projectId}`;
  const route = new SourceRoute({ ids });

  if (!projectId || !sourceId) {
    return null;
  }

  return (
    <Relay.RootContainer
      Component={SourceMenuContainer}
      route={route}
      renderFetched={data => <SourceMenuContainer {...props} {...data} />}
    />
  );
};

export default SourceMenuRelay;
