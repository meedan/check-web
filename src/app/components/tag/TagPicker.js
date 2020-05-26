import React from 'react';
import { FormattedMessage } from 'react-intl';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';
import { black54, units, opaqueBlack02, opaqueBlack05 } from '../../styles/js/shared';

const StyledNotFound = styled.div`
  color: ${black54};
  padding-top: ${units(14)};
  display: flex;
  justify-content: center;
`;

const StyledTagPickerArea = styled.div`
  padding: ${units(2)};
  height: ${units(32)};
  overflow-y: auto;
  border: 1px solid ${opaqueBlack05};
  background-color: ${opaqueBlack02};
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin-${props => props.theme.dir === 'rtl' ? 'right' : 'left'}: -14px !important;
  margin-${props => props.theme.dir === 'rtl' ? 'left' : 'right'}: 16px !important;
`;

class TagPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags.map(tag => tag.node.tag_text),
    };
  }

  handleSelectCheckbox = (e, inputChecked) => {
    const tags = this.state.tags.slice();
    const tag = e.target.id;
    if (inputChecked) {
      this.props.onAddTag(tag);
      tags.push(tag);
    } else {
      this.props.onRemoveTag(tag);
      tags.splice(tags.indexOf(tag), 1);
    }
    this.setState({ tags });
  }

  renderNotFound(totalTagsCount) {
    if (totalTagsCount === 0) {
      return (
        <StyledNotFound>
          <FormattedMessage
            id="tagPicker.emptyTags"
            defaultMessage="There are currently no tags for this workspace."
          />
        </StyledNotFound>
      );
    }

    return (
      <StyledNotFound>
        <FormattedMessage
          id="tagPicker.tagNotFound"
          defaultMessage="Tag #{tag} not found."
          values={{ tag: this.props.value }}
        />
      </StyledNotFound>
    );
  }

  render() {
    const { media, value } = this.props;

    const compareString = (tag, val) => {
      if (!tag) {
        return false;
      }
      return tag.toLowerCase().includes(val.toLowerCase());
    };

    const plainMediaTags = this.state.tags;
    const { tag_texts } = media.team;
    const shown_tag_texts = tag_texts.edges.filter(t => compareString(t.node.text, value));

    const shownTagsCount = shown_tag_texts.length;
    const totalTagsCount = tag_texts.edges.length;

    return (
      <StyledTagPickerArea>
        { shownTagsCount === 0 ?
          this.renderNotFound(totalTagsCount) :
          <FormGroup>
            {
              shown_tag_texts.map((tag, index) => (
                <StyledFormControlLabel
                  key={`team-suggested-tag-${index.toString()}`}
                  control={
                    <Checkbox
                      checked={plainMediaTags.includes(tag.node.text)}
                      onChange={this.handleSelectCheckbox}
                      id={tag.node.text}
                    />
                  }
                  label={tag.node.text}
                />
              ))
            }
          </FormGroup>
        }
      </StyledTagPickerArea>
    );
  }
}

TagPicker.propTypes = {

};

export default TagPicker;
