import styled from 'styled-components';
import { CardTitle } from 'material-ui/Card';

// Styles for overriding material UI
// General colors
//
export const white = '#ffffff';
export const black = '#000000';
export const alertRed = '#d0021b';
export const checkBlue = '#2e77fc';
export const highlightBlue = '#f1f6ff';
export const modalBlue = 'rgba(0, 15, 41, .9)';

// Material blacks
//
export const black87 = 'rgba(0, 0, 0, .87)';
export const black54 = 'rgba(0, 0, 0, .54)';
export const black38 = 'rgba(0, 0, 0, .38)';
export const black32 = 'rgba(0, 0, 0, .32)';
export const black16 = 'rgba(0, 0, 0, .16)';
export const black10 = 'rgba(0, 0, 0, .1)';
export const black05 = 'rgba(0, 0, 0, .05)';
export const black02 = 'rgba(0, 0, 0, .02)';

// Material blacks, translated to opaque versions
//
export const opaqueBlack87 = '#212121';
export const opaqueBlack54 = '#757575';
export const opaqueBlack38 = '#9e9e9e';
export const opaqueBlack16 = '#d6d6d6';
export const opaqueBlack10 = '#e5e5e5';
export const opaqueBlack05 = '#f2f2f2';
export const opaqueBlack02 = '#fafafa';

// Social network colors
//
export const facebookBlue = '#3b5999';
export const twitterBlue = '#0095ff';
export const googleorange = '#db4437';
export const slackgreen = '#2ab27b';

// Units
export function units(unit) {
  return `${unit * 8}px`;
}

// Typography
export const fontStackSans = '"Roboto", -apple-system, BlinkMacSystemFont, "Corbel", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Verdana, "Verdana Ref", sans-serif';

export const display3 = `400 ${units(7)}/${units(7)} ${fontStackSans}`;
export const display2 = `500 45px/${units(6)} ${fontStackSans}`;
export const display1 = `500 34px/${units(5)} ${fontStackSans}`;
export const headline = `500 ${units(3)}/${units(4)} ${fontStackSans}`;
export const title = `400 ${units(2.5)}/${units(4)} ${fontStackSans}`;
export const subheading2 = `400 ${units(2)}/${units(3.5)} ${fontStackSans}`;
export const subheading1 = `400 15px/${units(3)} ${fontStackSans}`;
export const body2 = `400 14px/${units(3)} ${fontStackSans}`;
export const body1 = `400 14px/${units(2.5)} ${fontStackSans}`;
export const caption = `400 ${units(1.5)}/${units(2.5)} ${fontStackSans}`;
export const tiny = `400 ${units(1)}/${units(1.5)} ${fontStackSans}`;

// Breakpoints
export const breakpointMobile = `${units(85)}`;

// Borders
export const defaultBorderRadius = '2px';
export const defaultBorderWidth = '1px';

// Shared Material UI style overrides using styled-components
//
export const StyledMdCardTitle =
  styled(CardTitle)` > span {
      font: ${title} !important;
    }
    padding-bottom: 8px !important;
  `;

export const FlexRow = styled.div` 
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Inline CSS
//
// The following styles are applied using the style prop:
//
// <Something style={somethingStyle} />
//
export const avatarStyle = {
  borderRadius: `${defaultBorderRadius}`,
  backgroundColor: 'transparent',
  border: `${defaultBorderWidth} solid ${black05}`,
};

export const titleStyle = {
  fontSize: `${units(2.5)}`,
  lineHeight: `${units(4)}`,
};

export const listStyle = {
  padding: '0',
  borderBottom: `${defaultBorderWidth} solid ${black05}`,
};

export const listItemStyle = {
  borderTop: `${defaultBorderWidth} solid ${black05}`,
};

export const listItemButtonStyle = {
  marginTop: `${units(1)}`,
};

export const buttonInButtonGroupStyle = {
  marginRight: `${units(1)}`,
};

export const cardInCardGroupStyle = {
  marginBottom: `${units(2)}`,
};

export const selectStyle = {
  minWidth: `${units(20)}`,
};

export const listItemWithButtonsStyle =
  Object.assign(listItemStyle, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

export const ellipsisStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
