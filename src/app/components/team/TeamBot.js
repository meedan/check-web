import React, { Component } from 'react';
import Form from '@meedan/react-jsonschema-form-material-ui-v1';
import styled from 'styled-components';
import FetchBot from './FetchBot';
import { units, black32 } from '../../styles/js/shared';

const StyledSchemaForm = styled.div`
  div {
    padding: 0 !important;
    box-shadow: none !important;
  }

  fieldset {
    border: 0;
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
    border: 1px solid ${black32};
  }

  fieldset fieldset button {
    display: block !important;
    width: 32px !important;
    background: #fff !important;
    border-radius: 5px !important;
    color: ${black32} !important;
  }
`;


class TeamBot extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.props.bot.name === 'Fetch') {
      return (<FetchBot />);
    }
    return (
      <StyledSchemaForm>
        <Form {...this.props} />
      </StyledSchemaForm>
    );
  }
}

export default TeamBot;
