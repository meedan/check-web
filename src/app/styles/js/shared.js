import styled, { css, keyframes } from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';

// Styles for overriding material UI
// Check Design System Colors
export const brandMain = '#567bff';
export const brandSecondary = '#3b5cd0';
export const brandLight = '#e7efff';
export const brandAccent = '#293e86';
export const brandBorder = '#d0d6ec';
export const brandBackground = '#f1f5f6';
export const brandHoverAccent = '#f2f8ff';// eslint-disable-line import/no-unused-modules

export const textPrimary = '#1f1f1f';
export const textSecondary = '#656565';
export const textPlaceholder = '#949494';
export const textDisabled = '#999';
export const textLink = '#3b5cd0';

export const validationMain = '#4caf50';
export const validationSecondary = '#237c27';
export const validationLight = '#f0fff1';

export const alertMain = '#e78a00';
export const alertSecondary = '#a66300';
export const alertLight = '#fff8ed';

export const errorMain = '#f44336';
export const errorSecondary = '#c9291d';// eslint-disable-line import/no-unused-modules
export const errorLight = '#ffeeed';// eslint-disable-line import/no-unused-modules

export const grayBackground = '#f7f7f7';
export const grayDisabledBackground = '#f3f3f3';
export const grayBorderMain = '#e4e4e4';
export const grayBorderAccent = '#b4b4b4';

export const overlayLight = 'rgba(34, 34, 34, 0.7)';

export const otherWhite = '#fff';

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
export const headline = `500 ${units(3)}/${units(4)} var(--fontStackSans)`;
export const title1 = `500 ${units(2.5)}/${units(4)} var(--fontStackSans)`;
export const body2 = `400 14px/${units(3)} var(--fontStackSans)`;
export const body1 = '400 14px var(--fontStackSans)';
export const caption = `400 ${units(1.5)}/${units(2.5)} var(--fontStackSans)`;

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
      main: brandMain,
    },
    secondary: {
      main: brandMain,
    },
    types: {
      light: {
        text: {
          primary: textPrimary,
        },
      },
    },
  },
  typography: {
    fontSize: 14,
    h1: {
      fontSize: '96px',
      fontWeight: 300,
      letterSpacing: '-1.5px',
      lineHeight: '112px',
    },
    h2: {
      fontSize: '60px',
      fontWeight: 300,
      letterSpacing: '-0.5px',
      lineHeight: '72px',
    },
    h3: {
      fontSize: '48px',
      fontWeight: 400,
      letterSpacing: '0px',
      lineHeight: '56px',
    },
    h4: {
      fontSize: '34px',
      fontWeight: 400,
      letterSpacing: '0.25px',
      lineHeight: '42px',
    },
    h5: {
      color: 'currentcolor',
      fontSize: '24px',
      fontWeight: 400,
      letterSpacing: '0px',
      lineHeight: '32px',
    },
    h6: {
      fontSize: '20px',
      fontWeight: 500,
      letterSpacing: '0.15px',
      lineHeight: '32px',
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: '0.15px',
      lineHeight: '21px',
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      lineHeight: '21px',
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: '0.15px',
      lineHeight: '20px',
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '0.15px',
      lineHeight: '17px',
    },
    button: {
      color: 'currentcolor',
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.4px',
      lineHeight: '24px',
      textTransform: 'none',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '0.4px',
      lineHeight: '15px',
    },
    overline: {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '1px',
      lineHeight: '32px',
      textTransform: 'uppercase',
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  overrides: { // Override of all material UI components. Information at https://material-ui.com/api/{component}
    MuiTableContainer: {
      root: {
        borderTop: `solid 1px ${grayBorderMain}`,
      },
    },
    MuiTableCell: {
      stickyHeader: {
        // @material-ui/core sets #fafafa, only for sticky header. Undo that.
        // We do need a color, though -- if we choose "transparent" the tbody
        // will show through.
        backgroundColor: otherWhite,
      },
      root: {
        fontSize: 14,
      },
    },
    MuiTableSortLabel: {
      active: {
        color: `${brandMain} !important`,
      },
      icon: {
        color: `${brandMain} !important`,
      },
    },
    MuiIconButton: { // Buttons with Icons
      root: {
        '&:hover': {
          backgroundColor: 'transparent',
          color: brandMain,
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
        border: `2px solid ${brandBorder}`,
      },
    },
    MuiTabs: {
      indicator: {
        right: 'auto',
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 8,
        '&:hover $notchedOutline': {
          borderColor: grayBorderAccent,
        },
        '&$focused $notchedOutline': {
          borderColor: brandMain,
        },
        '&.Mui-disabled $notchedOutline': {
          borderColor: grayBorderMain,
        },
      },
      notchedOutline: {
        borderWidth: 2,
        borderColor: grayBorderMain,
      },
      multiline: {
        padding: '6px 8px',
      },
      input: {
        padding: '6px 8px',
      },
    },
    MuiFormControl: {
      root: {
        borderRadius: 8,
      },
    },
    MuiInputLabel: {
      outlined: {
        transform: 'translate(6px, 9px) scale(1)',
      },
    },
    MuiInputBase: {
      input: {
        color: textPrimary,
        '&.Mui-disabled': {
          color: textDisabled,
        },
        '&::placeholder': {
          color: textPlaceholder,
          opacity: 1,
        },
      },
      inputMultiline: {
        lineHeight: '1.5em',
      },
      root: {
        '&.Mui-disabled': {
          background: grayDisabledBackground,
        },
      },
    },
    MuiFormLabel: {
      root: {
        color: textSecondary,
        '&.Mui-focused': {
          color: textSecondary,
        },
      },
    },
    MuiAutocomplete: {
      inputRoot: {
        '&[class*="MuiOutlinedInput-root"]': {
          padding: '0 6px',
        },
        '&[class*="MuiOutlinedInput-root"] $input': {
          padding: '8px 6px !important', // This !important shouldn't be necessary, but for some reason the exact same selector was not taking precedence over the lib one
        },
      },
    },
    MuiListItemIcon: {
      root: {
        fontSize: '1.5em',
      },
    }
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
  background: linear-gradient(90deg, ${grayDisabledBackground}, ${grayDisabledBackground}, ${grayBackground}, ${grayBackground}, ${otherWhite}, ${grayBackground}, ${grayDisabledBackground}, ${grayDisabledBackground});
  background-size: 400%;
`;

const pulseKeyframes = keyframes`
  0% {
    background-color: var(--otherWhite);
  }
  50% {
    background-color: var(--grayBackground);
  }
  100% {
    background-color: var(--otherWhite);
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
  font: 400 16px/28px var(--fontStackSans);
  color: var(--textSecondary);
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
  color: var(--textSecondary);
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
  max-width: ${props => props.maxWidth ? props.maxWidth : '720px'};
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

// It seems that this component is not centered in Material UI 0.x
// So we must always use this wrapper, or similar.
export const StyledIconButton = styled(IconButton)`
  font-size: 20px !important;
  svg {
    color: var(--textDisabled) !important;
    margin: 0!important;
  }
`;
