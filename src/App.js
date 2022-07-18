import './App.css';
import Print from './components/Print';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/tab.css';
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import Logo_EX from './public/logo_EX.png';
import Logo_COW from './public/logo_Cow.png';

function App() {

  return (
    <>
      <div className="App">
        <header className="App-header">
          <Print />
        </header>
        <div id="footer">
          <footer className="footer allCenter">
            <img src={Logo_EX} style={{ width: '50px' }} alt="logo"></img>
            <span style={{ fontSize: '20px', margin: '0 30px' }}>
              © 2022 by Gary Yang. Created by React Framework
            </span>
            <img src={Logo_COW} style={{ width: '50px' }} alt="logo"></img>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
