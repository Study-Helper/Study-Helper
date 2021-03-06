import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Add from 'material-ui/svg-icons/av/playlist-add';
import { Link } from 'react-router-dom';

/**
 * Renders an 'AddTask' button.
 * Passing startDate and endDate as the Link's state elements is a hacky
 * way to get them on the 'AddTask' screen, but...
 */
const AddTaskButton = ({ backPath, startDate, endDate }) => (
  <Link to={{ pathname: '/add-task', state: { backPath, startDate, endDate }}}>
    <RaisedButton
      primary
      style={{margin: '0px 30px 0px 20px'}}
      label='Add Task'
      labelPosition='before'
      icon={<Add />}
    />
  </Link>
);

export default AddTaskButton;
