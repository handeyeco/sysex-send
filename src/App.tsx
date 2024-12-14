import { useState, useEffect } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";

function App() {
  const [file, setFile] = useState<File>();
  const [midiOutputs, setMidiOutputs] = useState<ReadonlyArray<MIDIOutput>>([]);
  const [output, setOutput] = useState<MIDIOutput>();

  useEffect(() => {
    navigator.requestMIDIAccess({ sysex: true }).then((access) => {
      const nextOutputs = [];
      for (const out of access.outputs.values()) {
        nextOutputs.push(out);
      }

      setMidiOutputs(nextOutputs);
    });
  }, []);

  function handleSelectOutput(outputId: string) {
    const nextOutput = midiOutputs.find((e) => e.id === outputId);

    if (!nextOutput) {
      throw new Error(
        `handleSelectOutput: no MIDI out found with ID ${outputId}`
      );
    }

    setOutput(nextOutput);
  }

  function handleSelectSysex(e: React.ChangeEvent<HTMLInputElement>) {
    const newFile = e.target?.files?.[0];

    if (!newFile) {
      throw new Error("handleSelectSysex: no new file found");
    }

    setFile(newFile);
  }

  async function handleSendSysex() {
    if (!file) {
      throw new Error("handleSendSysex: no SysEx file found");
    }

    if (!output) {
      throw new Error("handleSendSysex: no MIDI out found");
    }

    const buffer = await file.arrayBuffer();
    const arr = new Uint8Array(buffer);
    output.send(arr);
  }

  return (
    <div className="app__container">
      <h1>SysEx Send</h1>
      <p>A web application for sending MIDI system exclusive (SysEx) messages to devices.</p>
      <ol>
        <li>Chrome is recommended, not all browsers implement Web MIDI</li>
        <li>Make sure your MIDI interface supports SysEx properly</li>
        <li>Be sure to back up your device before sending SysEx messages to it</li>
      </ol>
      <hr />
      <section className="app__section">
        <label>
          1. Select MIDI Output
          <select
            value={output?.id}
            onChange={(e) => handleSelectOutput(e.target.value)}
          >
            <option value={undefined}>-</option>
            {midiOutputs.map((e) => {
              return (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              );
            })}
          </select>
        </label>
      </section>

      <section className="app__section">
        <label>
          2. Select SysEx file
          <input type="file" accept=".syx" onChange={handleSelectSysex} />
        </label>
      </section>

      <section className="app__section">
        <label>
          3. Send SysEx
          <ul>
            <li>MIDI Output: { output ? output.name : "none selected"}</li>
            <li>SysEx File: { file ? file.name : "none selected"}</li>
          </ul>
          <button onClick={handleSendSysex} disabled={!file || !output}>Send SysEx</button>
        </label>
      </section>
    </div>
  );
}

export default App;
