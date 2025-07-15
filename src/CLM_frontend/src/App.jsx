import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Hooks/AuthContext";
import Layout from "./Components/Layout";
import Contracts from "./Pages/Contracts";
import EditContract from "./Pages/EditContract";
import Profile from "./Pages/Profile";

const App = () => {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Contracts />} />
              <Route path="profile" element={<Profile/>}/>
              <Route path="contract/:id" element={<EditContract />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
