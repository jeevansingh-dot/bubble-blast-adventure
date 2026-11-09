
import { useState } from "react";
import {
  getAudioSettings,
  setMusicEnabled,
  setSoundEnabled,
  sfx,
} from "../game/audio.js";

export default function SettingsPage() {
  const [settings, setSettings] = useState(getAudioSettings());

  function toggleMusic() {
    const next = !settings.music;
    setMusicEnabled(next);
    setSettings((prev) => ({ ...prev, music: next }));
  }

  function toggleSound() {
    const next = !settings.sound;
    setSoundEnabled(next);
    setSettings((prev) => ({ ...prev, sound: next }));
  }

  function testSound() {
    sfx.click();
  }

  return (
    <section className="settings-page">
      <div className="settings-heading">
        <span>⚙️ PLAYER PREFERENCES</span>
        <h1>Game Settings</h1>
        <p>Customize your Bubble Blast Adventure experience.</p>
      </div>

      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-info">
            <span className="settings-icon">🎵</span>
            <div>
              <h3>Background Music</h3>
              <p>Control the game's background music.</p>
            </div>
          </div>

          <button
            type="button"
            className={`settings-toggle ${settings.music ? "enabled" : ""}`}
            onClick={toggleMusic}
            aria-pressed={settings.music}
          >
            {settings.music ? "ON" : "OFF"}
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-info">
            <span className="settings-icon">🔊</span>
            <div>
              <h3>Sound Effects</h3>
              <p>Control shooting, popping and game sounds.</p>
            </div>
          </div>

          <button
            type="button"
            className={`settings-toggle ${settings.sound ? "enabled" : ""}`}
            onClick={toggleSound}
            aria-pressed={settings.sound}
          >
            {settings.sound ? "ON" : "OFF"}
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-info">
            <span className="settings-icon">🎮</span>
            <div>
              <h3>Test Sound</h3>
              <p>Check whether your sound effects are working.</p>
            </div>
          </div>

          <button
            type="button"
            className="settings-test-btn"
            onClick={testSound}
            disabled={!settings.sound}
          >
            Play Sound
          </button>
        </div>
      </div>

      <div className="settings-note">
        <span>💡</span>
        <p>
          Your music and sound preferences are saved automatically
          on this device.
        </p>
      </div>
    </section>
  );
}
