import styled from 'styled-components';

const LongShort = styled.p`
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* start showing ellipsis when maxLines is reached */
  -webkit-line-clamp: ${props => props.showAll ? 'none' : props.maxLines};
  max-height: ${props => props.showAll ? 'none' : `${props.maxLines * 20}px`};
`;

export default LongShort;
