import React from 'react';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import { browserHistory } from 'react-router';
import styled from 'styled-components';
import { searchPrefixFromUrl, searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import { highlightOrange } from '../../styles/js/shared';

const StyledHeader = styled.div`
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  ${props => props.active ? `color: ${highlightOrange};` : null}
`;

/* eslint-disable jsx-a11y/click-events-have-key-events */
class ListHeader extends React.Component {
  handleClick = () => {
    const query = searchQueryFromUrl();
    const sortTypes = ['DESC', 'ASC', null];

    if (query.sort === this.props.sort) {
      query.sort_type = sortTypes[(sortTypes.indexOf(query.sort_type) + 1) % 3];
    } else {
      query.sort = this.props.sort;
      query.sort_type = 'DESC';
    }

    if (query.sort_type === null) {
      delete query.sort;
      delete query.sort_type;
    }

    const prefix = searchPrefixFromUrl();
    browserHistory.push(urlFromSearchQuery(query, prefix));
  };

  sortIsSelected = () => {
    const query = searchQueryFromUrl();
    return (query.sort === this.props.sort);
  };

  render() {
    const icon = {
      ASC: <ExpandLess className="list-header__sort-asc" />,
      DESC: <ExpandMore className="list-header__sort-desc" />,
    };

    const query = searchQueryFromUrl();

    return (
      <StyledHeader
        id={`list-header__${this.props.sort}`}
        onClick={this.handleClick}
        active={this.sortIsSelected()}
      >
        {this.props.displayName}
        {this.sortIsSelected() ? icon[query.sort_type] : null}
      </StyledHeader>
    );
  }
}

export default ListHeader;
