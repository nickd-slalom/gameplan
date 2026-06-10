import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-title">Gameplan</h1>
        </div>
      </header>
      <main className="app-main">
        <section className="empty-state" aria-labelledby="setup-heading">
          <h2 id="setup-heading">Convention planning workspace</h2>
          <p>
            Organizer workflows will start here once the convention creation
            model and API are in place.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
