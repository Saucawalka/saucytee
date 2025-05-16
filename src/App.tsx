import { Route, Routes } from 'react-router-dom';
import Userauth from './components/Userauth';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Landingpage from './components/Landingpage';
// import Product from './components/Product';
import Dashboard from './components/Dashboard';
import Productform from './components/Productform';
import Orders from './components/Orders';
import Cart from './components/Cart';
import Accountmanagement from './components/Accountmanagement';
import Checkout from './components/Checkout';
import Ordersuccesspage from './components/Ordersuccespage';
import Addressbook from './components/Addressbook';
// import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import ProductDetail from './components/Productdetailpage';
import HelpChat from './components/HelpChat';
import AdminHelpChat from './components/AdminHelpChat';

function App() {
  return (
    <>
      
    

     
      <Routes>
        <Route path="/" element={<Landingpage/>} >
        
        </Route>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/productform" element={<Productform/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/dashboard/accmanagement" element={<Accountmanagement/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/order-success" element={<Ordersuccesspage />} />
        <Route path="/address" element={<Addressbook />} />
        {/* <Route path="/pay" element={<PaymentPage />} /> */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/help" element={<HelpChat />} />
        <Route path="adminchat" element={<AdminHelpChat/>} />


        
        <Route path='/' element={<Userauth/>}>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        </Route>

       
        {/* <Route path="/signup" element={<Signup />} /> */}
        
      </Routes>
    </>
  );
}

export default App;
