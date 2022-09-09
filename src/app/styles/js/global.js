import {
  checkBlue,
  white,
  body1,
  black,
  black87,
  title1,
  subheading1,
  textPrimary,
} from './shared';

export const layout = `
  html {
    background: ${white};
  }

  // Layout default settings
  //
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }
`;

export const typography = `
  body {
    color: ${textPrimary};
    font: ${body1};
  }

  h1,
  .main-title {
    color: ${black87};
    font: ${title1};
  }

  h2 {
    color: ${black87};
    font: ${subheading1};
  }

  h1, h2, h3, h4, h5 {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${checkBlue};

    &:hover {
      color: ${checkBlue};
    }

    &:visited {
      color: ${checkBlue};
    }

    &:not([href]) {
      &,
      &:hover {
        text-decoration: none;
      }
    }
  }

  a.link__internal {
    color: ${black};
    text-decoration: none;
  }

  p {
    margin-top: 0;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
`;

export const localeAr = `
  [lang="ar"] {
    * {
      letter-spacing: 0 !important;
    }

    body {
      font-size: 16px;
    }

    .home__disclaimer > span {
      font-size: 11px;
    }

    footer {
      font-size: 14px;
    }

    .rc-tooltip-inner {
      text-align: unset !important;
    }

    // Flip all icons except logos
    svg:not(.logo) {
      transform: scale(-1, 1);
    }
  }
`;

// Remove Chrome's yellow autofill
// https://blog.mariusschulz.com/2016/03/20/how-to-remove-webkits-banana-yellow-autofill-background
// NOTE this means inputs all have to be on a white canvas unless you override this.
export const removeYellowAutocomplete = `
  input:-webkit-autofill {
      -webkit-box-shadow: inset 0 0 0px 9999px white;
  }
`;
