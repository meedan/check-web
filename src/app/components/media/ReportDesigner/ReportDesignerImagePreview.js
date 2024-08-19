/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { escapeHtml } from '../../../helpers';

function overwriteDocumentHtml(contentDocument, html) {
  contentDocument.open();
  contentDocument.write(html);
  contentDocument.close();
}

function tweakIframeDom({
  contentDocument, date, defaultReport, description, headline, status_label, url,
}) {
  const fillInOrHide = (selector, textContent) => {
    const el = contentDocument.querySelector(selector);
    if (el) {
      if (textContent) {
        if (el.lastChild) {
          el.lastChild.nodeValue = textContent;
        } else {
          el.textContent = textContent;
        }
      } else {
        el.style.display = 'none';
      }
    }
  };
  fillInOrHide('#title', headline);
  fillInOrHide('#description', description);
  fillInOrHide('#status', status_label);
  fillInOrHide('#url', url);
  fillInOrHide('#date', date);
  fillInOrHide('#whatsapp', defaultReport.whatsapp);
  fillInOrHide('#facebook', defaultReport.facebook ? `m.me/${defaultReport.facebook}` : null);
  fillInOrHide('#twitter', defaultReport.twitter ? `@${defaultReport.twitter}` : null);
  fillInOrHide('#telegram', defaultReport.telegram ? `t.me/${defaultReport.telegram}` : null);
  fillInOrHide('#viber', defaultReport.viber ? defaultReport.viber : null);
  fillInOrHide('#line', defaultReport.line ? defaultReport.line : null);
  fillInOrHide('#instagram', defaultReport.instagram ? `instagram.com/${defaultReport.instagram}` : null);
}

function ReportImagePreview({
  date, defaultReport, image, params, style, teamAvatar, template,
}) {
  const [iframe, setIframe] = React.useState(null);

  const {
    dark_overlay,
    description,
    headline,
    status_label,
    theme_color: themeColor,
    url,
  } = params;

  // TODO don't use 'style' attribute at all
  const fullStyle = {
    border: 0,
    overflow: 'hidden',
    ...style,
  };

  const html = template
    .replace(/#CCCCCC/gi, themeColor)
    .replace(/%IMAGE_URL%/g, escapeHtml(image || ''))
    .replace('%AVATAR_URL%', escapeHtml(teamAvatar || ''));

  React.useEffect(
    () => {
      if (!iframe) {
        return;
      }
      const { contentDocument } = iframe;
      overwriteDocumentHtml(contentDocument, html);
      const theme = dark_overlay ? 'dark' : 'light';
      contentDocument.body.className += ` ${theme}`;
      tweakIframeDom({
        contentDocument, headline, description, status_label, url, date, defaultReport,
      });
    },
    [iframe, html, headline, description, status_label, url, dark_overlay, date],
  );

  return (
    <FormattedMessage
      defaultMessage="Report preview"
      description="Image caption spoken by screen readers but not seen by most users"
      id="reportDesigner.reportImagePreviewTitle"
    >
      {title => (
        <iframe
          ref={setIframe /* causing a re-render -- and thus useEffect() -- on load */}
          src="about:blank"
          style={fullStyle}
          title={title}
        />
      )}
    </FormattedMessage>
  );
}

ReportImagePreview.defaultProps = {
  image: null,
  teamAvatar: null,
  date: null,
  style: {},
  defaultReport: {},
};

ReportImagePreview.propTypes = {
  template: PropTypes.string.isRequired,
  image: PropTypes.string, // or null
  teamAvatar: PropTypes.string, // or null
  date: PropTypes.string, // or null
  style: PropTypes.object, // or null. TODO nix this prop
  params: PropTypes.shape({
    headline: PropTypes.string.isRequired,
    description: PropTypes.string, // or null
    status_label: PropTypes.string.isRequired,
    url: PropTypes.string, // or null
    theme_color: PropTypes.string.isRequired,
    dark_overlay: PropTypes.bool, // or null
  }).isRequired,
  defaultReport: PropTypes.object, // or null
};

export default ReportImagePreview;
