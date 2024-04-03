import { Component, ErrorBoundary } from 'solid-js';
import TopHeader from './components/TopHeader';
import { binarioGameSettings as gs, binarioExample as ex } from './Binario';
import { initializeGame } from './helpers/App.helpers';
import GameField from './components/GameField';

const App: Component = () => {
  let gamefield = initializeGame(ex, gs);

  return (
    <>
      <TopHeader gameTitle={gs.NAME} />
      <ErrorBoundary fallback={err => err}>
        <GameField gf={gamefield} />
      </ErrorBoundary>
    </>
  );
};

export default App;
