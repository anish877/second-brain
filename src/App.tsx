import { Route, Routes } from 'react-router'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import Login from './pages/Login'
import SharedView from './pages/ShareViewPage'

const App = () => {
  return (
    <>
        <Routes>
          <Route path={"/"} element={<Dashboard/>}/>
          <Route path={"/signup"} element={<Signup/>} />
          <Route path={"/login"} element={<Login/>} />
          <Route path={"/:shareId"} element={<SharedView />} />
        </Routes>
    </>
      
  )
}

export default App
