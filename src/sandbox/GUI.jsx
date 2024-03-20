import React from 'react';
import Clock from 'src/Clock';
import Legend from './Legend';
export default function GUI({
  curOption,
  setCurOption,
  speedyCounter,
  setSpeedyCounter,
  playing,
  setPlaying,
}) {
  return (
    <>
      <Clock
        counter={speedyCounter}
        displayMonth={false}
        dataset="averageDemandBaseline"
      />
      <Legend />
      <div className="styled-input">
        <button
          onClick={() => {
            setPlaying((p) => !p);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <div>
          <input
            style={{
              width: '10ch',
              display: 'block',
            }}
            type="number"
            value={speedyCounter}
            onChange={function (e) {
              setSpeedyCounter(parseInt(e.target.value));
            }}
          />
          <input
            onChange={function (e) {
              setPlaying(false);
              setSpeedyCounter(parseInt(e.target.value));
            }}
            onInput={function (e) {
              setSpeedyCounter(parseInt(e.target.value));
            }}
            value={speedyCounter}
            style={{
              width: '40vw',
              display: 'block',
            }}
            type="range"
            min="0"
            max="1199"
            id="myRange"
          />
        </div>
      </div>
    </>
  );
}
