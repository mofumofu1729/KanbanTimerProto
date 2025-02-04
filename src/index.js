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
      textBox: this.state.tasks[taskId].content,
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
    // Audio
    this.audio = new Audio("https://www.winhistory.de/more/winstart/down/o95.wav");

    // Timer
    const countTimerHandler = () => {
      let newState = this.state;
      newState.timerSecond -= 1;

      if (newState.timerSecond === 0) {  // 時間が来たらタイマーを鳴らす
        this.audio.play();
      }

      this.setState(newState);
    };

    this.interval = setInterval(countTimerHandler, 1000);
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

    const removeTask = () => {
      const taskId = this.state.selectedTask;

      if (!(taskId in this.state.tasks)) {
        return;
      }

      const newState = this.state;

      Object.keys(newState.columns).forEach((key) => {
        const ids = newState.columns[key].taskIds;

        for (let i = 0; i < ids.length; i++) {
          if (ids[i] === taskId) {
            newState.columns[key].taskIds.splice(i, 1);
          }
        }
      });

      this.setState(newState);
    };

    const updateTask = () => {
      const selectedTaskId = this.state.selectedTask;
      const newContent = this.state.textBox;

      const newState = this.state;
      newState.tasks[selectedTaskId].content = newContent;
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

    const resetTimer = (minutes) => {
      const newState = this.state;
      newState.timerSecond = minutes * 60;
      this.setState(newState);
    };

    return (
      <div>
        <div>
          <input type="text" value={this.state.textBox} id='newTaskTextBox'
                 onChange={(e) => this.setState({textBox: e.target.value})}/>
          <input type="button" value="add Task" onClick={addTask} />
        </div>

        <div>
          <input type="button" value="update task" onClick={updateTask} />
        </div>

        <div>
          <input type="button" value="remove task" onClick={removeTask} />
        </div>

        <div>
          <div>Timer: {(this.state.timerSecond/60)>0 ? Math.floor(this.state.timerSecond / 60) : Math.ceil(this.state.timerSecond/60)} m {this.state.timerSecond % 60} s</div>
          <div>
            <input type="button" value="reset Timer: 25min" onClick={() => {resetTimer(25);}}/>
            <input type="button" value="reset Timer: 5min" onClick={() => {resetTimer(5);}}/>
          </div>
        </div>

        <div>
          <input type="button" value="save tasks" onClick={saveTasks} />
        </div>
        <div>
          <input type="button" value="load tasks" onClick={loadTasks} />
        </div>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Container>
         {this.state.columnOrder.map(columnId => {
            const column = this.state.columns[columnId];
            const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks}
                           selectTask={this.selectTask}
                           selectedTaskId={this.state.selectedTask}/>;
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
