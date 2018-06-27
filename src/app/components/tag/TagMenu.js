import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import IconLocalOffer from 'material-ui/svg-icons/maps/local-offer';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import TagInput from './TagInput';
import TagPicker from './TagPicker';
import { can } from '../Can';
import { units } from '../../styles/js/shared';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

const StyledActions = styled.div`
  padding: ${units(2)};
  align-items: flex-end;
  flex-direction: row;
  display: flex;
`;

class TagMenu extends Component {
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
    this.setState({ menuOpen: false });
  };

  render() {
    const {
      media,
    } = this.props;

    const rtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const menuItems = [];

    if (can(media.permissions, 'update ProjectMedia') && !media.archived) {
      menuItems.push(<TagPicker
        key="tagPicker"
        value={this.state.value}
        media={media}
        tags={media.tags.edges}
      />);
    }

    const menuActions = (
      <StyledActions>
        <FlatButton
          style={{ marginLeft: 'auto' }}
          className="tag-menu__done"
          label={<FormattedMessage id="tagMenu.done" defaultMessage="Done" />}
          onClick={this.handleCloseMenu}
          primary
        />
      </StyledActions>
    );

    return menuItems.length ?
      <StyledIconMenuWrapper isRtl={rtl}>
        <IconMenu
          onClick={this.handleOpenMenu}
          open={this.state.menuOpen}
          onRequestChange={open => this.setState({ menuOpen: open })}
          iconButtonElement={
            <IconButton>
              <IconLocalOffer />
            </IconButton>
          }
        >
          <div>
            <TagInput media={media} onChange={this.handleChange} isRtl={rtl} />
            {menuItems}
            {menuActions}
          </div>
        </IconMenu>
      </StyledIconMenuWrapper>
      : null;
  }
}

TagMenu.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TagMenu);
