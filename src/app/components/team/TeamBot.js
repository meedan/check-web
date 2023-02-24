import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import FetchBot from './FetchBot';
import KeepBot from './KeepBot';
import { units, opaqueBlack32 } from '../../styles/js/shared';

const StyledSchemaForm = styled.div`
  div {
    padding: 0 !important;
    box-shadow: none !important;
    border: 0 !important;
  }

  fieldset {
    border: 0 !important;
    padding: 0;
  }

  button {
    display: none;
  }

  label + div {
    margin-top: 36px;
  }

  fieldset fieldset {
    padding: ${units(1)};
    margin-top: ${units(1)};
    border: 1px solid ${opaqueBlack32};
  }

  fieldset fieldset button {
    display: block !important;
    width: 32px !important;
    background: #fff !important;
    border-radius: 5px !important;
    color: ${opaqueBlack32} !important;
  }
  
  #bot-fetch fieldset div {
    display: none;
  }

  #bot-fetch fieldset div:last-child {
    display: block;
  }
`;


class TeamBot extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let botContent = null;
    switch (this.props.bot.identifier) {
    case 'fetch':
      botContent = (
        <FetchBot {...this.props} />
      );
      break;
    case 'keep':
      botContent = (
        <KeepBot {...this.props} />
      );
      break;
    default:
      botContent = null;
      break;
    }

    return (
      <React.Fragment>
        <StyledSchemaForm>
          <Box id={`bot-${this.props.bot.identifier}`}>
            {botContent}
          </Box>
        </StyledSchemaForm>
      </React.Fragment>
    );
  }
}

export default TeamBot;
