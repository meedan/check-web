import {
  opaqueBlack02,
  opaqueBlack54,
  body1,
  black87,
  title,
  black54,
  opaqueBlack87,
} from './shared';

export const layout = `
  html {
    background: ${opaqueBlack02};
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
    color: ${opaqueBlack54};
    font: ${body1};
  }

  h1,
  .main-title {
    color: ${black87};
    font: ${title};
  }

  h2 {
    color: ${black54};
  }

  a {
    color: ${opaqueBlack54};
    text-decoration: none;

    &:hover {
      color: ${opaqueBlack87};
      text-decoration: underline;
      transition: color .4s;
    }

    &:visited {
      color: ${opaqueBlack54};
    }

    &:not([href]) {
      &,
      &:hover {
        text-decoration: none;
      }
    }
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
    direction: rtl;

    * {
      letter-spacing: 0 !important;
    }

    body {
      font-size: 16px;
    }

    .home__disclaimer > span {
      font-size: 11px;
    }

    .footer {
      font-size: 14px;
    }

    .rc-tooltip-inner {
      text-align: unset !important;
    }

    .create-task__action-container {
      text-align: left !important;
    }

    // Flip all icons except logos
    svg:not(.logo) {
      transform: scale(-1, 1);
    }
  }
`;
