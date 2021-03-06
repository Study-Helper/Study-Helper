import React from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import ErrorIcon from 'material-ui/svg-icons/alert/error-outline';
import RegularTaskList from '../list/RegularTaskList.jsx';
import AddTaskButton from '../add-task/AddTaskButton.jsx';
import Search from 'material-ui/svg-icons/action/search';
import moment from 'moment';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';

import { appbar } from '../../styles/styles.css.js';
import Snackbar from 'material-ui/Snackbar';
import TaskManager from '../../server/managers/TaskManager.js';

class Today extends React.Component {

  constructor(props) {
    super(props);
    const loadedTasks = TaskManager.loadTasksByDate(moment().format('YYYY-MM-DD'));
    const { fromCategoriesManager, category } = this.props;
    // Synchronously load "today's" tasks.
    this.state = {
      tasks: fromCategoriesManager ? loadedTasks.filter(t => t.category === category.title) : loadedTasks,
      shouldRenderSnackbar: false,
      snackbarMessage: ''
    }
    this.closeSnackbar = this.closeSnackbar.bind(this);
  }

  componentWillMount() {
    let location = this.props.location;
    if (!location && this.props.calendarProps) {
      location = this.props.calendarProps.location;
    }

    if (location && location.state) {

      if (location.state.noRender) return;
      const { from, task } = location.state;

      let message = '';
      switch (from) {
        case 'task-started': message = 'Task completed!'; break;
        case 'task-added': message = 'Task added!'; break;
        case 'task-edited': message = 'Task edited!'; break;
        default: break;
      }

      setTimeout(
        () => this.setState((prevState, props) => {
          const tasks = prevState.tasks;
          // Huge hacks...
          if (from === 'task-started') {
            const localIndex = tasks.findIndex(i => i.id === task.id);
            tasks.splice(localIndex, 1);
          }
          return {
            shouldRenderSnackbar: true,
            snackbarMessage: message,
            tasks
          }
        }), 50);
    }
  }


  componentWillReceiveProps(nextProps) {
    //TODO: consider endDate (range[1])
    const { range } = nextProps;
    const date = range ? range[0] : '2017-09-05';
    this.setState({
      tasks: TaskManager.loadTasksByDate(date)
      // tasks: TaskManager.loadTasksByDate(range[0])
    });
  }

  /** @private */
  closeSnackbar() {
    this.setState({ shouldRenderSnackbar: false });
  }

  render() {
    const { title, height } = this.props;

    let pathname = undefined;
    if (this.props.location) {
      pathname = this.props.location.pathname;
    }
    if (!pathname && this.props.calendarProps) {
      pathname = this.props.calendarProps.location.pathname;
    } else if (!pathname && this.props.categoriesProps) {
      pathname = this.props.categoriesProps.location.pathname;
    }

    let history = this.props.history;
    if (!history && this.props.calendarProps) {
      history = this.props.calendarProps.history;
    } else if (!history && this.props.categoriesProps) {
      history = this.props.categoriesProps.history;
    }

    // If we're on 'Today', pass today's date.
    // Otherwise, we're on 'Calendar' - pass the picked date.
    const startDate = this.props.location || !this.props.calendarStartDate
      ? moment().format('YYYY-MM-DD')
      : this.props.calendarStartDate;

    const endDate = this.props.location || !this.props.calendarEndDate
      ? moment().format('YYYY-MM-DD')
      : this.props.calendarEndDate;

    return (
      <div>
        <Toolbar style={appbar.barLayout}>
          <ToolbarGroup firstChild>
            <ToolbarTitle style={appbar.header} text={title || `Today - ${moment().format("MMMM Do")}`} />
            <FontIcon className="muidocs-icon-custom-sort" />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            {
              this.state.tasks.length > 0 &&
              <div style={{position: 'relative', display: 'inline-block'}}>
                <Search style={{position: 'absolute', left: 0, top: 15, width: 20, height: 20, color: '#757575'}}/>
                <TextField hintText="Search" style={{textIndent: 30, width:'120px', paddingRight: 30}}/>
              </div>
            }
            {
              !this.props.fromCategoriesManager &&
              <AddTaskButton
                backPath={pathname}
                startDate={startDate}
                endDate={endDate}
              />
            }
          </ToolbarGroup>
        </Toolbar>
        {
          this.state.tasks.length > 0 ?
          <Scrollbars style={{ width: 697, height: height || 540 }}>
            <RegularTaskList
              tasks={this.state.tasks}
              withFilter={this.props.withFilter}
              history={history} // Pass the history for some crazy hacks
              fromCategoriesManager={this.props.fromCategoriesManager}
            />
          </Scrollbars> :
          <div style={{ color: '#9E9E9E', textAlign: 'center', fontFamily: 'Roboto', marginTop: '50px' }}>
            <div><ErrorIcon /></div>
            <div>No tasks to show!</div>
          </div>
        }
        <Snackbar
          style={{marginLeft: '70px'}}
          open={this.state.shouldRenderSnackbar}
          message={this.state.snackbarMessage}
          autoHideDuration={2000}
          onRequestClose={this.closeSnackbar}
        />
      </div>
    );
  }
}

Today.propTypes = {
  title: PropTypes.string,
  range: PropTypes.array,
  height: PropTypes.number,
  withFilter: PropTypes.bool,
  fromCategoriesManager: PropTypes.bool,
  category: PropTypes.object,
};

Today.defaultProps = {
  withFilter: true
};

export default Today;
