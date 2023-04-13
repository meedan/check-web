import React from 'react';
import styles from './BlankState.module.css';

export class StyledBlankState extends React.Component {
    render() {
        return <div className={['typography-h6', styles['blankState']].join(' ')}>{this.props.children}</div>
    }
}

export default StyledBlankState;
