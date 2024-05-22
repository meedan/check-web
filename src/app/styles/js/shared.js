// Styles for overriding material UI
// Check Design System Colors
// These are deprecated and only used in this file, use css variables in other files
const brandMain = '#37a0de';
const brandBorder = '#9fdbfc';

const colorPurple61 = '#9643f5';

const textPrimary = '#262626';
const textSecondary = '#5e5e5e';
const textPlaceholder = '#bfbfbf';
const textDisabled = '#979797';

const grayDisabledBackground = '#e0e0e0';
const grayBorderMain = '#e0e0e0';
const grayBorderAccent = '#bfbfbf';

export const MuiTheme = { // eslint-disable-line import/prefer-default-export
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
        color: `${colorPurple61} !important`,
      },
      icon: {
        color: `${colorPurple61} !important`,
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
