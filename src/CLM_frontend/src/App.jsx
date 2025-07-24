import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Hooks/AuthContext";
import Layout from "./Components/Layout";
import Contracts from "./Pages/Contracts";
import EditContract from "./Pages/EditContract";
import Profile from "./Pages/Profile";
import Connections from "./Pages/Connections";
import LockTokens from "./Components/LockTokens";
import DeliveryNote from "./Components/DeliveryNote";
import ConfirmDeliveryNote from "./Components/ConfirmDeliveryNote";
import Invoice from "./Components/Invoice";
import SettleInvoice from "./Components/SettleInvoice";

const App = () => {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Contracts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="contract/:id" element={<EditContract />} />
              <Route path="connections" element={<Connections />} />
              <Route path="contract/lock-tokens/:id" element={<LockTokens />} />
              <Route path="contract/delivery-note/:id" element={<DeliveryNote />} />
              <Route path="contract/confirm-delivery-note/:id" element={<ConfirmDeliveryNote />} />
              <Route path="contract/invoice/:id" element={<Invoice />} />
              <Route path="contract/settle-invoice/:id" element={<SettleInvoice/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
