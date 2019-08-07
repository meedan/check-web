import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import styled from 'styled-components';
import TagInput from './TagInput';
import TagPicker from './TagPicker';
import { can } from '../Can';
import { units } from '../../styles/js/shared';
import TagOutline from '../../../assets/images/tag/tag-outline';
import MediaRoute from '../../relay/MediaRoute';
import RelayContainer from '../../relay/RelayContainer';

const StyledActions = styled.div`
  padding: ${units(2)};
  align-items: flex-end;
  flex-direction: row;
  display: flex;
`;

class TagMenuComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
      value: '',
    };
  }

  handleChange = (value) => {
    this.setState({ value });
  };

  handleCloseMenu = () => {
    this.setState({ menuOpen: false, value: '' });
  };

  handlePopup = (open) => {
    if (open) {
      this.props.relay.forceFetch();
    }

    this.setState({ menuOpen: open });
  };

  render() {
    const { media } = this.props;

    if (!can(media.permissions, 'update ProjectMedia') || media.archived) {
      return null;
    }

    return (
      <IconMenu
        className="tag-menu__icon"
        onClick={this.handleOpenMenu}
        open={this.state.menuOpen}
        onRequestChange={this.handlePopup}
        iconButtonElement={
          <IconButton
            tooltip={
              <FormattedMessage id="tagMenu.tooltip" defaultMessage="Edit tags" />
            }
          >
            <TagOutline />
          </IconButton>
        }
      >
        <div>
          <TagInput media={media} onChange={this.handleChange} />
          <TagPicker
            value={this.state.value}
            media={media}
            tags={media.tags.edges}
          />
          <StyledActions>
            <FlatButton
              style={{ marginLeft: 'auto' }}
              className="tag-menu__done"
              label={<FormattedMessage id="tagMenu.done" defaultMessage="Done" />}
              onClick={this.handleCloseMenu}
              primary
            />
          </StyledActions>
        </div>
      </IconMenu>
    );
  }
}

const TagMenuContainer = Relay.createContainer(TagMenuComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        tags(first: 10000) {
          edges {
            node {
              tag,
              tag_text,
              id
            }
          }
        }
        team {
          name
          used_tags
          get_suggested_tags
        }
        permissions
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class TagMenu extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  shouldComponentUpdate(nextProps, nextState) {
    if (isEqual(this.props.tags, nextProps.tags) && isEqual(this.state, nextState)) {
      return false;
    }
    return true;
  }

  render() {
    const ids = `${this.props.media.dbid},${this.props.media.project_id}`;
    const route = new MediaRoute({ ids });

    return (
      <RelayContainer
        Component={TagMenuContainer}
        route={route}
        renderFetched={data => <TagMenuContainer {...this.props} {...data} />}
        forceFetch
      />
    );
  }
}

export default injectIntl(TagMenu);
