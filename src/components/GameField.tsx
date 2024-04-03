import { Component, For } from 'solid-js';
import { Table } from 'solid-bootstrap';
import { GameField, GameCell } from '../App.Types';

type propType = {
  gf: GameField
}

const GameField: Component<propType> = (props) => {
  let gf = props.gf

  return (
    <Table responsive='sm' borderless>
      <thead>
        <For each={gf[0]}>{(col, i) => <th>{i}</th>}</For>
      </thead>
      <For each={gf}>
        {(row, ri) => {
          // elements of gf are the rows
          let rrow = row[Number(ri)];
          return (
            <For each={rrow}>{(col, ci) => { 
              //  elements of the rows are cells
              return <th>{gf[Number(ci)][Number(ri)][GameCell.Possibilities]}</th>}}</For>
          );
        }}
      </For>
    </Table>
  );
};

export default GameField;
