import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store/store.js";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Master from "./pages/Master";
import QuotationPage from "./pages/Quatation/QuotationPage";
import VendorManagement from "./pages/Vendors/VendorManagement";
import Customer from "./pages/Customer";
import AddleadsForm from "./pages/Customer/AddleadsForm";
import LeadsDetails from "./pages/Customer/LeadsDetails";
import PaymentPage from "./pages/Payment/PaymentPage";
import PostProductionPage from "./pages/PostProduction/PostProductionPage";
import CreateQuote from "./pages/Customer/CreateQuote.jsx";
import Booking from "./pages/Booking.jsx";
import BookingdetailsPage from "./pages/Booking/BookingdetailsPage.jsx";
import VendorAssign from "./pages/Vendors/VendorAssign.jsx";
import Finishevents from "./pages/Booking/Finishevents.jsx";
import CalenderEvents from "./pages/Booking/CalenderEvents.jsx";
import Inventory from "./pages/Inventory/Inventory.jsx";
import InventoryList from "./pages/Inventory/InventoryList.jsx";
import AddInventory from "./pages/Inventory/AddInventory.jsx";
import Maintenance from "./pages/Inventory/Maintenance.jsx";
import EquipmentDetails from "./pages/Inventory/EquipmentDetails.jsx";
import AddMaintenance from "./pages/Inventory/AddMaintenance.jsx";
import AssigndInventory from "./pages/Inventory/AssigndInventory.jsx";
import EditleadsDetails from "./pages/Customer/EditleadsDetails.jsx";
import VendorDetails from "./pages/Vendors/VendorDetails.jsx";
import UserManagement from "./pages/Settings/UserManagement.jsx";
import AvailableVendors from "./pages/Vendors/AvailableVendors.jsx";
import AssignedVendor from "./pages/Vendors/AssignedVendor.jsx";
import InstallmentDetails from "./pages/Payment/InstallmentDetails.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import PostProductionDetail from "./pages/Postproduction/PostProductionDetail.jsx";
import Login from "./pages/Login.jsx";
import BookingCalender from "./pages/BookingCalender.jsx";
import TaskDetail from "./pages/Postproduction/TaskDetail.jsx";
import Invoice from "./pages/Payment/Invoice.jsx";
import FinalizedQuotation from "./pages/Customer/FInalizedQuotation.jsx";
import EventServicesTable from "./pages/Postproduction/EventServicesTable.jsx";
import AssignedTaskList from "./pages/Postproduction/AssignedTaskList.jsx";
import AssignmentDetails from "./pages/Postproduction/AssignmentDetails.jsx";
import PaymentDetials from "./pages/Payment/PaymentDetials.jsx";
import DailyTaskCalendar from "./pages/DailyTask/DailyTaskCalendar.jsx";
import DailyTasksTable from "./pages/DailyTask/DailyTasksTable.jsx";
import FollowUpCalendar from "./pages/FollowUp/FollowUpCalendar.jsx";
import PaymentFollowUpsByDate from "./pages/FollowUp/PaymentFollowUpsByDate.jsx";
import CallFollowUpsByDate from "./pages/FollowUp/CallFollowUpsByDate.jsx";
import BookedQuotationsByQuery from "./pages/Booking/BookedQuotationsByQuery.jsx";
import SortedDataList from "./pages/Postproduction/SortedDataList.jsx";

import "react-calendar/dist/Calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";
import DeliverableDetailPage from "./pages/Postproduction/DeliverableDetailPage.jsx";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Provider store={store}>
      <Router>
        {isLoggedIn ? (
          <>
            <Toaster position="top-right" />
            <Layout handleLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
      
                <Route path="/master" element={<Master />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/quotation" element={<QuotationPage />} />
                <Route path="/booking-list" element={<Booking />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/vendors" element={<VendorManagement />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/post-production" element={<PostProductionPage />} />
                <Route path="/booking/booking-details/:id" element={<BookingdetailsPage />} />
                <Route path="/booking/finished-events" element={<Finishevents />} />
                <Route path="/booking/calender-events" element={<CalenderEvents />} />
                <Route path="/customer/addLeads" element={<AddleadsForm />} />
                <Route path="/customer/addLeads/:id" element={<AddleadsForm />} />
                <Route path="/customer/leadsDetails/:leadId/:queryId" element={<LeadsDetails />} />
                <Route path="/customer/edit-details/:leadId/:queryId" element={<EditleadsDetails />} />
                <Route path="/customer/create-quote/:leadId/:queryId" element={<CreateQuote />} />
                <Route path="/vendors/vendor-assign/:quotationId/:packageId" element={<VendorAssign />} />
                <Route path="/inventory/inventory-list" element={<InventoryList />} />
                <Route path="/inventory/add-inventory" element={<AddInventory />} />
                <Route path="/inventory/maintenance" element={<Maintenance />} />
                <Route path="/inventory/add-maintenance" element={<AddMaintenance />} />
                <Route path="/inventory/equipment-details" element={<EquipmentDetails />} />
                <Route path="/inventory/assigned-inventory" element={<AssigndInventory />} />
                <Route path="/vendors/vendor-details/:id" element={<VendorDetails />} />
                <Route path="/settings/add-User" element={<UserManagement />} />
                <Route path="/vendors/available-vendors/:serviceName" element={<AvailableVendors />} />
                <Route path="/vendors/assigned-vendor" element={<AssignedVendor />} />
                <Route path="/payment/installment-details/:quotationId" element={<InstallmentDetails />} />
                <Route path="/payment/payment-details/:quotationId" element={<PaymentDetials />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/post-production/post-production-detail/:id" element={<PostProductionDetail />} />
                <Route path="/booking" element={<BookingCalender />} />
                <Route path="/post-production/task-detail/:eventId" element={<TaskDetail />} />
                <Route path="/invoice/:quotationId" element={<Invoice />} />
                <Route path="/quote/finalized-quotation/:id" element={<FinalizedQuotation />} />
                <Route path="/post-production/post-production-detail/assign-task" element={<EventServicesTable />} />
                <Route path="/assignments/:eventId/:serviceName" element={<AssignedTaskList />} />
                <Route path="/assignment-details/:assignmentId" element={<AssignmentDetails />} />
                <Route path="/daily-task" element={<DailyTaskCalendar />} />
                <Route path="/daily-task/list" element={<DailyTasksTable />} />
                <Route path="/follow-ups/calendar" element={<FollowUpCalendar />} />
                <Route path="/follow-ups/call-later" element={<CallFollowUpsByDate />} />
                <Route path="/follow-ups/date/:date" element={<PaymentFollowUpsByDate />} />
                <Route path="/booking/by-query/:queryId" element={<BookedQuotationsByQuery />} />
                <Route path="/post-production/post-production-detail/sorted-data/:quotationId" element={<SortedDataList />} />
                <Route path="/deliverables/:quotationId" element={<DeliverableDetailPage />} />
              </Routes>
            </Layout>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login handleLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </Provider>
  );
}

export default App;
