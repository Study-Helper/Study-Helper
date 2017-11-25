import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import PlaylistAddCheck from 'material-ui/svg-icons/av/playlist-add-check';
import Timeline from 'material-ui/svg-icons/action/timeline';
import Timelapse from 'material-ui/svg-icons/image/timelapse';
import TagFaces from 'material-ui/svg-icons/image/tag-faces';
import { List, ListItem } from 'material-ui/List';
import { blue500, indigo500, teal500, yellow500 } from 'material-ui/styles/colors';
import GradesChart from './charts/GradesChart.jsx';
import TasksChart from './charts/TasksChart.jsx';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import { taskList, appbar, statisticButtons } from '../../styles/styles.css.js';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TaskManager from '../../server/managers/TaskManager.js';

class StatisticsReworked extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      chart: "grades",
      insights: [
        {
          primary: 'Number of Completed Tasks',
          value: TaskManager.getNumberOfCompletedTasks()
        },
         {
          primary: 'Most Used Category',
          value: 'Studying'
        },
        {
          primary: 'Average Task Duration',
          value: '00:15 h'
        },
        {
          primary: 'Total Time Spent',
          value: '08:02 h'
        }
      ]
    }
    this.handleChartChange = this.handleChartChange.bind(this);
  }

  handleChartChange(event, index, chart) {
    this.setState({ chart });
  }

  getAvatar(index) {
    switch (index) {
      case 0: return <Avatar style={{ backgroundColor: blue500 }} icon={<PlaylistAddCheck />} />;
      case 1: return <Avatar style={{ backgroundColor: indigo500 }} icon={<TagFaces />} />;
      case 2: return <Avatar style={{ backgroundColor: teal500 }} icon={<Timeline />} />;
      case 3: return <Avatar style={{ backgroundColor: yellow500 }} icon={<Timelapse />} />;
      default: return;
    }
  }

  render() {
    const chart = this.state.chart === "grades" ? <GradesChart /> : <TasksChart />;
    return (
      <div>
        <Toolbar style={appbar.barLayout}>
          <ToolbarGroup firstChild>
            <ToolbarTitle style={{'marginLeft': '15px'}} text="Statistics" />
            <FontIcon className="muidocs-icon-custom-sort" />
          </ToolbarGroup>
        </Toolbar>

        <List style={{marginTop: '-9px'}}>
          {this.state.insights.map((data, index) =>
            <div key={index}>
              <ListItem
                key={index}
                disableTouchRipple
                style={{fontFamily: 'Roboto'}}
                primaryText={data.primary}
                leftAvatar={this.getAvatar(index)}
              >
                <div style={{float: 'right', marginRight: '15px'}}>{data.value}</div>
              </ListItem>
              {index < this.state.insights.length - 1 &&
                <Divider style={{backgroundColor: '#EEEEEE', width: '650px', marginLeft: '20px'}} />}
            </div>
          )}
        </List>

        <ListItem
          disabled
          disableTouchRipple
          primaryText={'Charts'}
          style={{color: '#757575', fontFamily: 'Roboto', backgroundColor: '#F5F5F5', marginRight: '-10px'}}
        >
          <DropDownMenu
            value={this.state.chart}
            onChange={this.handleChartChange}
            style={{marginRight: '-20px', marginTop: '-25px', float:'right', width: '160px'}}
          >
            <MenuItem value={"grades"} primaryText="Grades" />
            <MenuItem value={"tasks"} primaryText="Tasks" />
          </DropDownMenu>
        </ListItem>
        {chart}
      </div>
    );
  }
}

export default StatisticsReworked;
