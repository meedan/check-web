import styled from 'styled-components';
import { columnWidthSmall, columnWidthMedium, columnWidthWide, units } from '../../styles/js/variables';

const ContentColumn = styled.div`
  margin: 0 auto;
  padding: 0 ${props => props.noPadding ? '0' : units(1)};
  width: 100%;
  max-width: ${columnWidthMedium};
  ${props => props.narrow ? `max-width: ${columnWidthSmall}` : ''}
  ${props => props.wide ? `max-width: ${columnWidthWide}` : ''}
  ${props => props.flex ? 'display: flex; flex-direction: column;' : ''}
`;

export default ContentColumn;
