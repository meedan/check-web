import React, { Component, PropTypes } from 'react';
import {GridList, GridTile} from 'material-ui/lib/grid-list';
import IconButton from 'material-ui/lib/icon-button';
import StarBorder from 'material-ui/lib/svg-icons/toggle/star-border';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {

    overflowY: 'auto',
    marginBottom: 24,
  },
};

const tilesData = [
  {
    img: 'http://www.material-ui.com/images/grid-list/camera-813814_640.jpg',
    title: 'Breakfast',
    description: 'jill111',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/00-52-29-429_640.jpg',
    title: 'Tasty burger',
    description: 'pashminu',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/burger-827309_640.jpg',
    title: 'Camera',
    description: 'Danson67',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    description: 'fancycrave1',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/burger-827309_640.jpg',
    title: 'Camera',
    description: 'Danson67',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    description: 'fancycrave1',
  },{
    img: 'http://www.material-ui.com/images/grid-list/burger-827309_640.jpg',
    title: 'Camera',
    description: 'Danson67',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    description: 'fancycrave1',
  },{
    img: 'http://www.material-ui.com/images/grid-list/burger-827309_640.jpg',
    title: 'Camera',
    description: 'Danson67',
  },
  {
    img: 'http://www.material-ui.com/images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    description: 'fancycrave1',
  }
];


class TeamProjects extends Component {
  render() {
    return (
      <div >
    <GridList
      style={styles.gridList}
    >
      {tilesData.map((tile) => (
        <GridTile

          title={tile.title}
          subtitle={tile.description}
        >
          <img src={tile.img} />
        </GridTile>
      ))}
    </GridList>
  </div>
    );
  }
}

export default TeamProjects;
