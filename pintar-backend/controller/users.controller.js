import Registration from "./Category/Registration.js";
import Login from "./Category/Login.js";
import GetPlateLicense from "./Category/GetPlateLicense.js";
import AddVehicle from "./Category/AddVehicle.js";
import FetchingPlateLicense from "./Category/FetchingPlateLicense.js";
import GetVehicleDetail from "./Category/GetVehicleDetail.js";
import DeleteVehicle from "./Category/DeleteVehicle.js";
import Logout from "./Category/Logout.js";
import OutdoorParking from "./Category/OutdoorParking.js";
import PetakPayment from "./Category/PetakPayment.js";
import Getreceiptparking from "./Category/GetReceipt.js";
import Saman from "./Category/Saman.js";
import GetSamanHistory from "./Category/GetSamanHistory.js";
import PayByPetak from "./Category/PaySamanByPetak.js";
import SeasonalPayment from "./Category/SeasonalPayment.js";
import GetreceiptSeasonal from "./Category/GetReceiptSeasonal.js";
import SeasonalUpdateDuration from "./Category/SeasonalUpdateDuration.js";
import CarExit from "./Category/CarExit.js";
import SeasonalGetDetail from "./Category/SeasonalGetDetail.js";
import SeasonalCancel from "./Category/SeasonalCancel.js";
import SeasonalActiveInactive from "./Category/SeasonalActiveInactive.js";
import FetchTransactionForPetak from "./Category/FetchTransactionForPetak.js";
import FetchTransactionForSeasonal from "./Category/FetchTransactionForSeasonal.js";
import FetchDuration from "./Category/FetchDuration.js";
import DeleteAccount from "./Category/DeleteAccount.js";
import SeasonalCheckPlateLicense from "./Category/SeasonalCheckPlateLicense.js";
import EmailVerification from "./Category/VerifyEmail.js";
import ResetPassword from "./Category/ResetPassword.js";
import path from "path";
import authenticateToken from "./Middleware/authenticateToken.js";

export default function ({ app, __dirname, express }) {
  app.use("/register", Registration);
  app.use("/login", Login);
  app.use("/getplatelicense", authenticateToken, GetPlateLicense);
  app.use("/addvehicle", authenticateToken, AddVehicle);
  app.use("/getplatlicense", authenticateToken, FetchingPlateLicense);
  app.use("/getvehicledetail", authenticateToken, GetVehicleDetail);
  app.use("/deletevehicledetail", authenticateToken, DeleteVehicle);
  app.use("/logout", authenticateToken, Logout);
  app.use("/outdoorparking", authenticateToken, OutdoorParking);
  app.use("/petakpayment", authenticateToken, PetakPayment);
  app.use("/getreceiptparking", authenticateToken, Getreceiptparking);
  app.use("/saman", authenticateToken, Saman);
  app.use("/getsamanhistory", authenticateToken, GetSamanHistory);
  app.use("/paybypetak", authenticateToken, PayByPetak);
  app.use("/seasonalpayment", authenticateToken, SeasonalPayment);
  app.use("/getreceiptseasonal", authenticateToken, GetreceiptSeasonal);
  app.use("/seasonalupdateduration", authenticateToken, SeasonalUpdateDuration);
  app.use("/carexit", authenticateToken, CarExit);
  app.use("/seasonalgetdetail", authenticateToken, SeasonalGetDetail);
  app.use("/seasonalcancel", authenticateToken, SeasonalCancel);
  app.use("/seasonalactiveinactive", authenticateToken, SeasonalActiveInactive);
  app.use(
    "/fetchtransactionforpetak",
    authenticateToken,
    FetchTransactionForPetak
  );
  app.use(
    "/fetchtransactionforseasonal",
    authenticateToken,
    FetchTransactionForSeasonal
  );
  app.use("/fetchduration", authenticateToken, FetchDuration);
  app.use("/deleteaccount", authenticateToken, DeleteAccount);
  app.use(
    "/seasonalcheckplatelicense",
    authenticateToken,
    SeasonalCheckPlateLicense
  );
  app.use("/emailverification", EmailVerification);
  app.use("/resetpassword", ResetPassword);

  // ✅ Serve static files BEFORE all routes
  app.use(
    "/static",
    express.static(path.join(__dirname, "/controller/Category/Public"))
  );

  // Then your route to serve the HTML page
  app.get("/reset-password", (req, res) => {
    res.sendFile(
      path.resolve("controller/Category/Public/reset-password.html")
    );
  });
}
