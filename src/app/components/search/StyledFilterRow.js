import styled from 'styled-components';
import {
  black87,
  Row,
  units,
  mediaQuery,
} from '../../styles/js/shared';

const StyledFilterRow = styled(Row)`
  min-height: ${units(5)};
  margin-bottom: ${units(2)};
  flex-wrap: wrap;

  h4 {
    text-transform: uppercase;
    color: ${black87};
    margin: 0;
    min-width: ${units(6)};
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
    line-height: ${units(4 /* eyeballing it */)};
  }

  ${mediaQuery.tablet`
    justify-content: flex-end;
    h4 {
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: auto;
    }
  `};

  ${mediaQuery.handheld`
    padding: 0;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    &::-webkit-scrollbar { // Hide scrollbar
      width: 0px;
      height: 0px;
      background: transparent;
    }

    h4 {
      padding: ${units(0.5)};
      text-align: ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')};
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
    }
  `}
`;

export default StyledFilterRow;
