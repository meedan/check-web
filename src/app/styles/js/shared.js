import styled, { css, keyframes } from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';

// Styles for overriding material UI
// General colors
//
export const white = '#ffffff';
export const black = '#000000';
export const alertRed = '#d0021b';
export const checkBlue = '#2e77fc';
export const checkOrange = '#f2994a';
export const checkError = '#fa555f';
export const inProgressYellow = '#efac51';
export const completedGreen = '#5cae73';
export const separationGray = '#E5E5E5';
export const brandSecondary = '#DFE4F4';
export const backgroundMain = '#F7F8FD';

// Material blacks
// TODO make these opaque!
// TODO change their names!
// TODO https://material.io/design/color/the-color-system.html
export const black87 = 'rgba(0, 0, 0, .87)';
export const black54 = 'rgba(0, 0, 0, .54)';
export const black38 = 'rgba(0, 0, 0, .38)';
export const black32 = 'rgba(0, 0, 0, .32)';
export const black16 = 'rgba(0, 0, 0, .16)';
export const black05 = 'rgba(0, 0, 0, .05)';
export const black02 = 'rgba(0, 0, 0, .02)'; // eslint-disable-line import/no-unused-modules

// Material blacks, translated to opaque versions
//
export const opaqueBlack87 = '#212121';
export const opaqueBlack54 = '#757575';
export const opaqueBlack38 = '#9e9e9e';
export const opaqueBlack23 = '#c4c4c4';
export const opaqueBlack16 = '#d6d6d6';
export const opaqueBlack10 = '#e5e5e5';
export const opaqueBlack07 = '#eeeeee';
export const opaqueBlack05 = '#f2f2f2'; // eslint-disable-line import/no-unused-modules
export const opaqueBlack03 = '#f8f8f8';
export const opaqueBlack02 = '#fafafa'; // eslint-disable-line import/no-unused-modules

// Social network colors
//
// https://facebookbrand.com/facebookapp/advertisers-and-partners/
export const facebookBlue = '#1877f2';
// https://about.twitter.com/content/dam/about-twitter/company/brand-resources/en_us/Twitter_Brand_Guidelines_V2_0.pdf
export const twitterBlue = '#1da1f2';
// https://slack.com/intl/en-it/marketing/img/media-kit/slack_brand_guidelines_september2020.pdf
export const slackGreen = '#2eb67d';
// https://www.youtube.com/about/brand-resources/#logos-icons-colors
export const youTubeRed = '#ff0000';
// https://whatsappbrand.com/#color
export const whatsappGreen = '#25D366';
// https://www.schemecolor.com/telegram-color.php
export const telegramBlue = '#0088CC';
// https://www.viber.com/en/brand-center/
export const viberPurple = '#7360f2';
// https://line.me/en/logo
export const lineGreen = '#00b900';

// Units
export function units(unit) {
  return `${unit * 8}px`;
}

const columnWidthSmall = units(56);
const columnWidthMedium = units(85);
const columnWidthLarge = units(110);
const columnWidthWide = units(152);

// Typography
const fontStackSans = '"Roboto", -apple-system, BlinkMacSystemFont, "Corbel", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Verdana, "Verdana Ref", sans-serif';

export const headline = `500 ${units(3)}/${units(4)} ${fontStackSans}`;
export const title1 = `500 ${units(2.5)}/${units(4)} ${fontStackSans}`;
export const subheading1 = `400 15px/${units(3)} ${fontStackSans}`;
export const subheading2 = `400 ${units(2)}/${units(3.5)} ${fontStackSans}`;
export const body2 = `400 14px/${units(3)} ${fontStackSans}`;
export const body1 = `400 14px ${fontStackSans}`;
export const caption = `400 ${units(1.5)}/${units(2.5)} ${fontStackSans}`;

// Layout
export const headerHeight = units(8);
export const gutterLarge = units(5);
export const gutterMedium = units(3);
export const gutterSmall = units(2);

// Breakpoints
export const breakpointMobile = `${columnWidthSmall}`;
const breakpointTablet = `${columnWidthMedium}`;
const breakpointDesktop = `${columnWidthLarge}`;

// Borders
export const borderWidthSmall = '1px';
export const borderWidthMedium = '2px';
export const borderWidthLarge = '3px';

// Border radius
export const defaultBorderRadius = '2px';

// CSS Helpers
//
// Can be applied in a stylesheet or added to a styled component.
// For an ellipsis without fixed width, a parent should have overflow: hidden
// And that parent (or any descendants) should not be display: flex
// See: https://codepen.io/unthinkingly/pen/XMwJLG
//
const ellipsisStyles = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

export const backgroundCover = 'background-repeat: no-repeat; background-position: center; background-size: cover;';

export const avatarSizeLarge = units(9);
export const avatarSize = units(5);
export const avatarSizeSmall = units(4);
export const avatarSizeExtraSmall = units(3);

export const MuiTheme = {
  palette: {
    type: 'light',
    primary: {
      main: checkBlue,
    },
    secondary: {
      main: checkBlue,
    },
    types: {
      light: {
        text: {
          primary: black87,
        },
      },
    },
  },
  overrides: { // Override of all material UI components. Information at https://material-ui.com/api/{component}
    MuiTableCell: {
      stickyHeader: {
        // @material-ui/core sets #fafafa, only for sticky header. Undo that.
        // We do need a color, though -- if we choose "transparent" the tbody
        // will show through.
        backgroundColor: white,
      },
    },
    MuiTableSortLabel: {
      active: {
        color: `${checkBlue} !important`,
      },
      icon: {
        color: `${checkBlue} !important`,
      },
    },
    MuiIconButton: { // Buttons with Icons
      root: {
        '&:hover': {
          backgroundColor: 'transparent',
          color: checkBlue,
        },
      },
    },
    MuiTab: {
      root: {
        padding: '8px 16px',
        minWidth: 0,
        '@media (min-width: 0px)': {
          minWidth: 0,
        },
        textTransform: 'none',
      },
      wrapper: {
        alignItems: 'flex-start',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: 'none',
        border: `2px solid ${brandSecondary}`,
      },
    },
    MuiTabs: {
      indicator: {
        right: 'auto',
      },
    },
  },
};

export const mediaQuery = {
  handheld: (...args) => css`@media (max-width: ${breakpointMobile}) { ${css(...args)} }`,
  tablet: (...args) => css`@media (max-width: ${breakpointTablet}) { ${css(...args)} }`,
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

const pulseKeyframes = keyframes`
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
// deprecated: use @material-ui/core/Typography and theme
export const Text = styled.div`
  ${props => props.ellipsis ? ellipsisStyles : ''}
  ${props => props.font ? `font: ${props.font};` : ''}
  ${props => props.center ? 'text-align: center;' : ''}
  ${props => props.color ? `color: ${props.color};` : ''}
  ${props => props.breakWord ? breakWordStyles : ''}
  ${props => props.noShrink ? 'flex-shrink: 0;' : ''}
  ${props => props.maxWidth ? `max-width: ${props.maxWidth}` : ''}
`;

export const HeaderTitle = styled.h3`
  ${ellipsisStyles}
  font: ${subheading2};
  color: ${black54};
  max-width: 45vw;
  ${mediaQuery.tablet`
     max-width: 27vw;
  `}
  ${mediaQuery.handheld`
     max-width: 18vw;
  `}
`;

// FIXME: use Typography and/or a dedicated component under components/layout
export const StyledSubHeader = styled.h2`
  font: ${title1};
  font-weight: 600;
  color: ${black54};
  text-align: center;
  margin-top: ${units(2)};
`;

// FIXME: rename and use dedicated component under components/layout
export const StyledCard = styled(Card)`
  padding: ${units(11)} ${units(15)} ${units(3)} !important;
  ${mediaQuery.handheld`
    padding: ${units(8)} ${units(4)} ${units(3)} !important;
  `}
`;

// <Row />
//
// The prop `containsEllipsis` adds overflow to flex-items in case any descendant uses ellipsis
// See: https://codepen.io/unthinkingly/pen/XMwJLG
//
export const Row = styled.div`
  display: flex;
  ${props => props.flexWrap ? 'flex-wrap: wrap;' : 'flex-wrap: nowrap;'}
  ${props => props.alignTop ? 'align-items: top;' : 'align-items: center;'}
  ${props => props.containsEllipsis ? '& > * {overflow: hidden; }' : ''}
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

// content column used in  settings
// We want to align left together with the setting menu
export const ContentColumn = styled.div`
  margin: ${props => props.center ? 'auto' : '0 0 0 32px'};
  padding: 0;
  width: 100%;
  max-width: ${columnWidthMedium};
  ${props => props.narrow ? `max-width: ${columnWidthSmall}` : ''}
  ${props => props.large ? `max-width: ${columnWidthLarge}` : ''}
  ${props => props.wide ? `max-width: ${columnWidthWide}` : ''}
  ${props => props.fullWidth ? 'max-width: 100%' : ''}
  ${props => props.remainingWidth ? 'max-width: calc(100vw - 320px)' : '' /* 320px = 32px (margin left) + 256px (left bar width) + 32px (margin right) */}
  ${props => props.flex ? 'display: flex; flex-direction: column;' : ''}
`;

export const Column = styled.div`
  flex: 1;
  min-width: 340px;
  max-width: 720px;
  padding: ${units(2)};
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: ${props => props.overflow ? props.overflow : 'auto'};
`;

// AlignOpposite
export const AlignOpposite = styled.div`
  ${props => props.theme.dir === 'rtl' ? 'margin-right: auto' : 'margin-left: auto'};
  ${props => props.theme.dir === 'rtl' ? 'left: 0px' : 'right: 0px'};
  width: fit-content;
`;

// Tags (ensure wrapping, alignment when many tags)
export const StyledTagsWrapper = styled.div`
  display: inline;
  flex-wrap: wrap;
  > div {
    display: inline-flex !important;
    margin: ${units(0.5)} ${units(1)} ${units(0.5)} 0 !important;
    > span {
      color: ${black54} !important;
    }
  }
`;

// It seems that this component is not centered in Material UI 0.x
// So we must always use this wrapper, or similar.
export const StyledIconButton = styled(IconButton)`
  font-size: 20px !important;
  svg {
    color: ${black38} !important;
    margin: 0!important;
  }
`;
