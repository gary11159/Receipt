import './App.css';
import Print from './components/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/tab.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
      <div className="App">
        <header className="App-header">
          <Print />
        </header>
      </div>
    </>
  );
}

export default App;
