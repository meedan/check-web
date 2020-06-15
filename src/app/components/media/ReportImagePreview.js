import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import escapeHtml from 'escape-html';

function overwriteDocumentHtml(contentDocument, html) {
  contentDocument.open();
  contentDocument.write(html);
  contentDocument.close();
}

function tweakIframeDom({
  contentDocument, headline, description, status_label, url,
}) {
  const fillIn = (selector, textContent) => {
    const el = contentDocument.querySelector(selector);
    if (el) {
      el.textContent = textContent;
    }
  };
  fillIn('#title', headline);
  fillIn('#description', description);
  fillIn('#status', status_label);
  fillIn('#url', url);
}

function ReportImagePreview({
  template, teamAvatar, image, style, params,
}) {
  const [iframe, setIframe] = React.useState(null);

  const {
    theme_color: themeColor,
    headline,
    description,
    status_label,
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
    .replace('%IMAGE_URL%', escapeHtml(image || ''))
    .replace('%AVATAR_URL%', escapeHtml(teamAvatar || ''));

  React.useEffect(
    () => {
      if (!iframe) {
        return;
      }
      const { contentDocument } = iframe;
      overwriteDocumentHtml(contentDocument, html);
      tweakIframeDom({
        contentDocument, headline, description, status_label, url,
      });
    },
    [iframe, html, headline, description, status_label, url],
  );

  return (
    <FormattedMessage
      id="reportDesigner.reportImagePreviewTitle"
      description="Image caption spoken by screen readers but not seen by most users"
      defaultMessage="Report preview"
    >
      {title => (
        <iframe
          ref={setIframe /* causing a re-render -- and thus useEffect() -- on load */}
          src="about:blank"
          title={title}
          style={fullStyle}
        />
      )}
    </FormattedMessage>
  );
}
ReportImagePreview.defaultProps = {
  image: null,
  teamAvatar: null,
  style: {},
};
ReportImagePreview.propTypes = {
  template: PropTypes.string.isRequired,
  image: PropTypes.string, // or null
  teamAvatar: PropTypes.string, // or null
  style: PropTypes.object, // or null. TODO nix this prop
  params: PropTypes.shape({
    headline: PropTypes.string.isRequired,
    description: PropTypes.string, // or null
    status_label: PropTypes.string.isRequired,
    url: PropTypes.string, // or null
    theme_color: PropTypes.string.isRequired,
  }).isRequired,
};

export default ReportImagePreview;
