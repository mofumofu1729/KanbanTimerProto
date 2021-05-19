import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';

const Container = styled.div`
  display: flex;
`;

class App extends React.Component {
  state = initialData;

  selectTask = (taskId) => {
    const newState = {
      ...this.state,
      selectedTask: taskId,
    };
    this.setState(newState);
  };

  onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...this.state,
        columns : {
	  ...this.state.columns,
	  [newColumn.id]: newColumn,
        },
      };


    this.setState(newState);
    return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    this.setState(newState);
  };

  componentDidMount() {
    // Timer
    const countTimer = () => {
      let newState = this.state;
      newState.timerSecond += 1;
      this.setState(newState);
    };

    this.interval = setInterval(countTimer, 1000);
  }

  render() {
    const addTask = () => {
      const newId =
        'task-' + (Object.keys(this.state.tasks).length + 1).toString();
      const newContent = document.getElementById('newTaskTextBox').value;
      const newTask = {id: newId, content: newContent};

      let newState = this.state;
      newState.tasks[newTask.id] = newTask;
      newState.columns['column-1'].taskIds.push(newTask.id);
      this.setState(newState);
    };

    const saveTasks = () => {
      localStorage.setItem('state', JSON.stringify(this.state));
    };

    const loadTasks = () => {
      const savedStateString = localStorage.getItem('state');
      const savedState = JSON.parse(savedStateString);
      this.setState(savedState);
    };

    return (
      <div>
        <div>
          <input type="text" value={this.state.textBox} id='newTaskTextBox'
                 onChange={(e) => this.setState({textBox: e.target.value})}/>
          <input type="button" value="add Task" onClick={addTask} />
        </div>

        <div>
          <input type="button" value="save tasks" onClick={saveTasks} />
        </div>

        <div>
          <input type="button" value="load tasks" onClick={loadTasks} />
        </div>

        <div>selected task: {this.state.selectedTask}</div>

        <div>Timer: {Math.floor(this.state.timerSecond / 60)} m {this.state.timerSecond % 60} s</div>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Container>
         {this.state.columnOrder.map(columnId => {
            const column = this.state.columns[columnId];
            const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks}
                           selectTask={this.selectTask}/>;
          })}
          </Container>
       </DragDropContext>
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
