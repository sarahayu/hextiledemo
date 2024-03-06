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
      <div
        onChange={function (e) {
          setCurOption(e.target.value);
        }}
        style={{
          position: 'absolute',
          display: 'block',
          bottom: '60%',
          right: '0',
          transform: 'translateY(50%)',
        }}
      >
        <div>
          <input
            type="radio"
            name="option"
            value="0"
            checked={curOption == 0}
          />
          <label htmlFor="option1">Option 1</label>
        </div>

        <div>
          <input
            type="radio"
            name="option"
            value="1"
            checked={curOption == 1}
          />
          <label htmlFor="option2">Option 2</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="2"
            checked={curOption == 2}
          />
          <label htmlFor="option2">GW</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="3"
            checked={curOption == 3}
          />
          <label htmlFor="option2">Scenario Unmet Dem</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="4"
            checked={curOption == 4}
          />
          <label htmlFor="option2">Difference</label>
        </div>
      </div>
    </>
  );
}
