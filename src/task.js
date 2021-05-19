import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
border: 1px solid lightgrey;
border-radius: 2px;
paddding: 8px;
margin-buttom: 8px;
`;

export default class Task extends React.Component {
  render() {
    return (
      <div onClick={e => this.props.selectTask(this.props.task.id)}>
      <Draggable draggableId={this.props.task.id} index={this.props.index}>
        {(provided) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            {this.props.task.content}
          </Container>
        )}
      </Draggable>
      </div>
    );
  }
}
