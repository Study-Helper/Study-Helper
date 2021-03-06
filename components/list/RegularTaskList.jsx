import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem } from 'material-ui/List';
import { red100 } from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import PlayArrow from 'material-ui/svg-icons/AV/play-arrow';
import Done from 'material-ui/svg-icons/action/done';
import IconButton from 'material-ui/IconButton';
import TaskDescription from './TaskDescription.jsx';
import MoreOptionsButton from '../more-options/MoreOptionsButton.jsx';
import EditIcon from 'material-ui/svg-icons/content/create';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import CheckButton from './CheckButton.jsx';
import Divider from 'material-ui/Divider';
import { taskList } from '../../styles/styles.css.js';

import RemoveTaskModal from '../modals/task-modals/RemoveTaskModal.jsx';
import TaskManager from '../../server/managers/TaskManager.js';
import CategoryManager from '../../server/managers/CategoryManager.jsx';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class RegularTaskList extends React.Component {

  constructor(props) {
    super(props);
    this.state = { tasks: TaskManager.sortTasksByPriority(props.tasks), sortValue: 'Priority' }
    this.subscribeToTaskUpdatedEvents = this.subscribeToTaskUpdatedEvents.bind(this);
    this.subscribeToTaskRemovedEvents = this.subscribeToTaskRemovedEvents.bind(this);
    this.subscribeToTaskAddedEvents = this.subscribeToTaskAddedEvents.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.goToEditTaskScreen = this.goToEditTaskScreen.bind(this);
  }

  componentWillMount() {
    this.subscribeToTaskUpdatedEvents();
    this.subscribeToTaskRemovedEvents();
    this.subscribeToTaskAddedEvents();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.taskUpdatedToken);
    PubSub.unsubscribe(this.taskAddedToken);
    PubSub.unsubscribe(this.taskRemovedToken);
  }

  /** @private */
  subscribeToTaskUpdatedEvents() {
    this.taskUpdatedToken = PubSub.subscribe(
      'Task Updated',
      (message, data) => this.setState((prevState, props) => {
        const tasks = prevState.tasks;
        const localIndex = tasks.findIndex(i => i.id === data.editedTask.id);
        tasks[localIndex] = data.editedTask;
        return { tasks }
      })
    );
  }

  /** @private */
  subscribeToTaskAddedEvents() {
     this.taskAddedToken = PubSub.subscribe(
      'Regular - Task Added',
      (message, data) => this.setState((prevState, props) => {
        const tasks = prevState.tasks;
        // NOTE: data = { task, indexInTheList || undefined }
        const task = data.addedTask;
        const index = data.indexInTheList;
        // Iff we're coming from and undo, indexInTheList is not undefined.
        // Otherwise, add it to the end.
        const indexToInsert = index !== undefined ? index : tasks.length;
        tasks.splice(indexToInsert, 0, task);
        return { tasks }
      })
    );
  }

  /** @private */
  subscribeToTaskRemovedEvents() {
    this.taskRemovedToken = PubSub.subscribe(
      'Regular - Task Removed',
      (message, data) => this.setState((prevState, props) => {
        const tasks = prevState.tasks;
        const localIndex = tasks.findIndex(i => i.id === data.removedTask.id);
        tasks.splice(localIndex, 1);
        return { tasks }
      })
    );
  }

  /** @private */
  getCategoryAvatarData(category) {
    return categories[category];
  }

  /** @private */
  goToEditTaskScreen(task) {
    const backPath = this.props.history.location.pathname;
    this.props.history.push({
      pathname: '/edit-task',
      state: { task, backPath, taskLocation: 'todo_tasks' }
    });
  }

  /** @private */
  openRemoveModal(task) {
    const indexInTheList = this.state.tasks.findIndex(i => i.id === task.id);
    RemoveTaskModal.openSelf(task, indexInTheList);
  }

  /** @private */
  editTaskOption(task) {
    return {
      name: 'Edit',
      icon: <EditIcon />,
      onClickFunction: () => this.goToEditTaskScreen(task)
    }
  }

  /** @private */
  removeTaskOption(task) {
    return {
      name: 'Remove',
      icon: <DeleteIcon />,
      onClickFunction: () => this.openRemoveModal(task)
    }
  }

  handleSortChange(event, index, value) {
    this.setState((prevState, props) => {
      const tasks = prevState.tasks;
      const sortedTasks = TaskManager.sortTasksBy(tasks, value);
      return { sortValue: value, tasks: sortedTasks };
    });
  }

  getSecondaryTitle(task) {
    if (task.priority === 1) {
      return `${TaskManager.prettifyEstimatedDuration(task)} | Priority task`;
    }
    return TaskManager.prettifyEstimatedDuration(task);
  }

  render() {
    const tasks = this.state.tasks;
    return (
      <div>
        {
          this.props.withFilter &&
          <ListItem
            disabled
            style={{height: '18px', color: '#757575', paddingRight: '0px', fontFamily: 'Roboto', backgroundColor: '#F5F5F5'}}
          >
            <div>
              <div style={{marginTop: '1px'}}>
                Order by:
              </div>
              <DropDownMenu
                value={this.state.sortValue}
                onChange={this.handleSortChange}
                style={{marginTop: '-36px', 'marginLeft':'50px'}}
              >
                <MenuItem value={"Priority"} primaryText="Priority" />
                <MenuItem value={"Category"} primaryText="Category" />
                <MenuItem value={"Duration"} primaryText="Duration" />
              </DropDownMenu>
            </div>
          </ListItem>
        }
        <List style={taskList.list}>
          {tasks.map((task, index) =>
            <div key={index}>
              <ListItem
                key={index}
                disableTouchRipple
                primaryText={task.name}
                secondaryText={this.getSecondaryTitle(task)}
                nestedItems={[<TaskDescription key={1} task={task} />]}
                style={(task.priority === 1) ? { backgroundColor: red100 } : {}}
                leftAvatar={<Avatar
                  size={35}
                  icon={CategoryManager.getCategoryIconFromString(task.category)}
                  backgroundColor={CategoryManager.getCategoryBackgroundColorFromString(task.category)}
                  style={taskList.avatar}
                />}
              >
                {
                  !this.props.fromCategoriesManager &&
                  <MoreOptionsButton options={[
                    this.editTaskOption(task),
                    this.removeTaskOption(task)
                  ]} />
                }
                {
                  !this.props.fromCategoriesManager &&
                  <CheckButton
                    task={task}
                    indexInTheList={this.state.tasks.findIndex(i => i.id === task.id)}
                  />
                }
                {
                  !this.props.fromCategoriesManager &&
                  <Link to={{
                    pathname: 'task-started',
                    state: { task, taskList, index: this.state.tasks.findIndex(i => i.id === task.id) } }}>
                    <IconButton tooltip='Start!' style={taskList.iconButton}>
                      <PlayArrow color='#424242' />
                    </IconButton>
                  </Link>
                }
              </ListItem>
              {index < tasks.length - 1 &&
                <Divider style={{backgroundColor: '#EEEEEE', width: '650px', marginLeft: '20px'}} />}
            </div>
          )}
        </List>
        <RemoveTaskModal />
      </div>
    );
  }
}

export default RegularTaskList;
