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
      <Legend />
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
            value="1"
            checked={curOption == 1}
          />
          <label htmlFor="option2">HexTile</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="2"
            checked={curOption == 2}
          />
          <label htmlFor="option2">Election</label>
        </div>
        <div>
          <input
            type="radio"
            name="option"
            value="3"
            checked={curOption == 3}
          />
          <label htmlFor="option2">Demographics</label>
        </div>
      </div>
    </>
  );
}
