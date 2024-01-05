import styled, { css, keyframes } from 'styled-components';
import IconButton from '@material-ui/core/IconButton';

// Styles for overriding material UI
// Check Design System Colors
// These are deprecated and only used in this file, use css variables in other files
const brandMain = '#567bff';
const brandBorder = '#d0d6ec';

const textPrimary = '#262626';
const textSecondary = '#656565';
const textPlaceholder = '#949494';
const textDisabled = '#999';

const grayDisabledBackground = '#f3f3f3';
const grayBorderMain = '#e4e4e4';
const grayBorderAccent = '#b4b4b4';

// Units
export function units(unit) {
  return `${unit * 8}px`;
}

// CSS Helpers
//
// Can be applied in a stylesheet or added to a styled component.
//

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
        backgroundColor: '#fff',
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
      rounded: {
        borderRadius: 8,
      },
      elevation8: {
        boxShadow: '0 5px 5px -3px rgba(0, 0, 0, .20), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12)',
        border: `2px solid ${brandBorder}`,
      },
      elevation24: {
        boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, .12)',
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
    },
    MuiDialog: {
      paper: {
        border: `2px solid ${brandBorder}`,
        borderRadius: 16,
        minWidth: '550px',
      },
    },
  },
};

export const mediaQuery = {
  handheld: (...args) => css`@media (max-width: 448px) { ${css(...args)} }`,
  tablet: (...args) => css`@media (max-width: 680px) { ${css(...args)} }`,
  desktop: (...args) => css`@media (min-width: 880px) { ${css(...args)} }`,
};

// ===================================================================
// Styled Components
//
// Used as components, like: <Row />
//
// ===================================================================

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
  max-width: 680px;
  ${props => props.narrow ? 'max-width: 448px' : ''}
  ${props => props.large ? 'max-width: 880px' : ''}
  ${props => props.wide ? 'max-width: 1216px' : ''}
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

// It seems that this component is not centered in Material UI 0.x
// So we must always use this wrapper, or similar.
export const StyledIconButton = styled(IconButton)`
  font-size: 20px !important;
  svg {
    color: var(--textDisabled) !important;
    margin: 0!important;
  }
`;
