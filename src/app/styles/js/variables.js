import styled, { css, keyframes } from 'styled-components';
import { CardTitle } from 'material-ui/Card';
import { stripUnit, rgba } from 'polished';

// Styles for overriding material UI
// General colors
//
export const white = '#ffffff';
export const black = '#000000';
export const alertRed = '#d0021b';
export const checkBlue = '#2e77fc';
export const highlightBlue = '#f1f6ff';
export const modalBlue = 'rgba(0, 15, 41, .8)';

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
export const googleOrange = '#db4437';
export const slackGreen = '#2ab27b';

// Units
export function units(unit) {
  return `${unit * 8}px`;
}

export const columnWidthSmall = units(56);
export const columnWidthMedium = units(85);
export const columnWidthLarge = units(100);
export const columnWidthWide = units(152);
export const appBarInnerHeight = units(7);

// Unitless
export function unitless(unit) {
  return stripUnit(units(unit));
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

// Layout
export const headerHeight = units(8);
export const gutterMedium = units(3);

// Breakpoints
export const breakpointMobile = `${columnWidthMedium}`;
export const breakpointDesktop = `${columnWidthLarge}`;

// Transitions
export const transitionSpeedFast = '150ms';
export const transitionSpeedDefault = '300ms';
export const transitionSpeedSlow = '500ms';

// Borders
export const defaultBorderRadius = '2px';
export const defaultBorderWidth = '1px';

// Material design box shadows
//
export function boxShadow(level) {
  if (level === 1) {
    return `0 1px 6px ${rgba(black, 0.12)}, 0 1px 4px ${rgba(black, 0.12)}`;
  } else if (level === 2) {
    return `0 3px 10px ${rgba(black, 0.16)}, 0 3px 10px ${rgba(black, 0.23)}`;
  } else if (level === 3) {
    return `0 10px 30px ${rgba(black, 0.19)}, 0 6px 10px ${rgba(black, 0.23)}`;
  } else if (level === 4) {
    return `0 14px 45px ${rgba(black, 0.25)}, 0 10px 18px ${rgba(black, 0.22)}`;
  } else if (level === 5) {
    return `0 19px 60px ${rgba(black, 0.3)}, 0 15px 20px ${rgba(black, 0.22)}`;
  }

  return null;
}

// ===================================================================
// Inline CSS
//
// The following styles are applied to a component using the style prop:
//
// <Foo style={somethingStyle} />
// ===================================================================

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

// CSS Helpers
//
// Can be applied in a stylesheet or added to a styled component.
// For an ellipsis without fixed width, a parent should have overflow: hidden
// And that parent (or any descendants) should not be display: flex
// See: https://codepen.io/unthinkingly/pen/XMwJLG
//
export const ellipsisStyles = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

export const backgroundCover = 'background-repeat: no-repeat; background-position: center; background-size: cover;';

export const largeAvatarSize = units(9);
export const avatarSize = units(5);

export const avatarStyle = `
  border: ${defaultBorderWidth} solid ${black05};
  border-radius: ${defaultBorderRadius};
  flex: 0 0 auto;
  height: ${largeAvatarSize};
  width: ${largeAvatarSize};
  ${backgroundCover}
  background-color: ${white};
`;

// Material UI theme configuration
//
// This is passed as a prop to <MuiThemeProvider>
//
export const muiThemeWithoutRtl = {
  palette: {
    primary1Color: checkBlue,
    primary2Color: checkBlue,
    primary3Color: checkBlue,
    accent1Color: checkBlue,
    accent2Color: checkBlue,
    accent3Color: checkBlue,
    pickerHeaderColor: checkBlue,
  },
  appBar: {
    color: black02,
  },
  svgIcon: {
    color: black54,
  },
  ripple: {
    color: checkBlue,
  },
  tabs: {
    backgroundColor: white,
    textColor: checkBlue,
    selectedTextColor: checkBlue,
  },
  inkBar: {
    backgroundColor: checkBlue,
  },
  menuItem: {
    hoverColor: highlightBlue,
  },
  overlay: {
    backgroundColor: modalBlue,
  },
};


export const mediaQuery = {
  handheld: (...args) => css`@media (max-width: ${breakpointMobile}) { ${css(...args)} }`,
  desktop: (...args) => css`@media (min-width: ${breakpointDesktop}) { ${css(...args)} }`,
};

const shimmerKeyframes = keyframes`
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
`;

export const Shimmer = styled.div`
  animation: ${shimmerKeyframes} 1s ease-out infinite;
  animation-fill-mode: forwards;
  background: linear-gradient(90deg, ${opaqueBlack05}, ${opaqueBlack05}, ${opaqueBlack02}, ${opaqueBlack02}, ${white}, ${opaqueBlack02}, ${opaqueBlack05}, ${opaqueBlack05});
  background-size: 400%;
`;


export const pulseKeyframes = keyframes`
  0% {
    background-color: ${white};
  }
  50% {
    background-color: ${opaqueBlack02};
  }
  100% {
    background-color: ${white};
  }
`;

export const Pulse = styled.div`
  animation: ${pulseKeyframes} 1s infinite;
`;

// For positioning Material-UI menus
export const defaultAnchorOrigin = {
  horizontal: 'left',
  vertical: 'bottom',
};

export const breakWordStyles = `
  hyphens: auto;
  overflow-wrap: break-word;
  word-break: break-word;
`;

// ===================================================================
// Styled Components
//
// Used as components, like: <Text />
//
// ===================================================================

// Text with optional ellipsis prop
//
// <Text ellipsis />
//
export const Text = styled.div`
  ${props => props.ellipsis ? ellipsisStyles : ''}
  ${props => props.font ? `font: ${props.font}` : ''}
`;

export const HeaderTitle = styled.h3`
  ${ellipsisStyles}
  font: ${subheading2};
  color: ${black54};
  max-width: 65vw;
  margin: ${props => props.offset ? units(2) : '0'};
  ${mediaQuery.handheld`
     max-width: 35vw;
  `}
`;

// <Row />
//
// The prop `containsEllipsis` adds overflow to flex-items
// See: https://codepen.io/unthinkingly/pen/XMwJLG
//
export const Row = styled.div`
  display: flex;
  align-items: center;
  ${props => props.containsEllipsis ? '& > * {overflow: hidden; }' : ''}
`;

// Shared Material UI style overrides using styled-components
// This is not ideal because of the !important declarations ...
// Still figuring out how best to customize our Material components,
// feedback welcome! WIP CGB 2017-7-12
//
export const StyledMdCardTitle =
  styled(CardTitle)` > span {
      font: ${title} !important;
    }
    padding-bottom: 8px !important;
  `;

// A Flexbox row, center aligned
//
// Deprecated: just use Row — CGB 2017 Sept 15
//
export const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// FadeIn
//
// 1. This is a styled component that uses their keyframes function
const fadeInKeyframes = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

// 2. Now we can wrap elements in <FadeIn>
export const FadeIn = styled.div`
  animation: ${fadeInKeyframes} ease-in .3s;
  animation-duration: .3s;
  animation-fill-mode: forwards;
  opacity: 0;
`;
