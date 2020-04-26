import React from 'react';

class ReportImagePreview extends React.Component {
  componentDidMount() {
    this.setContent();
    this.applyParams();
  }

  componentDidUpdate() {
    this.setContent();
    this.applyParams();
  }

  setContent() {
    let { template } = this.props;
    let imageUrl = null;
    if (this.props.params.image) {
      imageUrl = this.props.params.image;
    } else if (this.props.image) {
      imageUrl = this.props.image.preview;
    }
    template = template
      .replace(/#CCCCCC/gi, this.props.params.theme_color)
      .replace('%IMAGE_URL%', imageUrl)
      .replace('%AVATAR_URL%', this.props.teamAvatar);
    const doc = document.getElementById('report-image-preview').contentWindow.document;
    doc.open();
    doc.write(template);
    doc.close();
  }

  applyParams() {
    const doc = document.getElementById('report-image-preview').contentWindow.document;
    const title = doc.getElementById('title');
    title.innerHTML = this.props.params.headline;

    const description = doc.getElementById('description');
    description.innerHTML = this.props.params.description || '';

    const status = doc.getElementById('status');
    status.innerHTML = this.props.params.status_label;

    const url = doc.getElementById('url');
    if (this.props.params.url) {
      url.innerHTML = this.props.params.url;
    }
  }

  render() {
    const customStyle = this.props.style || {};
    const style = Object.assign({ border: 0, overflow: 'hidden' }, customStyle);

    return (
      <iframe
        src="about:blank"
        id="report-image-preview"
        title="report-image-preview"
        style={style}
      />
    );
  }
}

export default ReportImagePreview;
