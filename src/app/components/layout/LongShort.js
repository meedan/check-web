import styled from 'styled-components';
import { breakWordStyles } from '../../styles/js/shared';

const LongShort = styled.div`
  ${breakWordStyles}
  max-height: ${props => props.showAll ? 'none' : '120px'}; // 6 (max-lines) x 20px (line-height)
  overflow: hidden;
`;

export default LongShort;
