import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../cds/media-cards/Card';
import styles from './ItemCard.module.css';

const ItemCard = ({
  description,
}) => {
  // eslint-disable-next-line
  console.log('~~~');
  return (
    <div className={`${styles.itemCard} item-card`}>
      <Card
        title="Hi hi hi"
        description={description}
        date={1702677106.846}
        footer={<div>footer</div>}
      />
    </div>
  );
};

ItemCard.defaultProps = {
};

ItemCard.propTypes = {
  description: PropTypes.string.isRequired,
};

export default ItemCard;
