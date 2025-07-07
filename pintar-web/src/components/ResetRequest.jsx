import React from "react";
import { FaTimes } from "react-icons/fa";
import { useSocket } from "../../context/socket";
import "./ResetRequest.css";

const ResetRequest = ({ data, onClose }) => {
  const { socket } = useSocket();

  const handleReset = ({ operatorId }) => {
    socket.emit("approveResetRequest", { operatorId }, (response) => {
      if (response.status === 200) {
        alert("Password reset successfully.");
        onClose(); // Close modal after success
      } else {
        alert(`Error resetting password: ${response.message}`);
      }
    });
  };

  const handleReject = ({ operatorId }) => {
    socket.emit("rejectResetRequest", { operatorId }, (response) => {
      if (response.status === 200) {
        alert("Password reset rejected.");
        onClose(); // Close modal after success
      } else {
        alert(`Error rejecting password reset: ${response.message}`);
      }
    });
  };

  return (
    <div className="reset-request-overlay" onClick={onClose}>
      <span
        className="reset-request-container"
        onClick={(e) => e.stopPropagation()}
      >
        <FaTimes
          className="reset-request-close-icon"
          size={20}
          color="maroon"
          onClick={onClose}
        />
        <h3>Password Reset Requests</h3>
        <table className="reset-request-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th colSpan={2}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.ID}</td>
                <td>{item.USERNAME}</td>
                <td>{item.EMAIL}</td>
                <td>{item.PHONENUMBER}</td>
                <td>
                  <button
                    className="reset-request-btn reset"
                    onClick={() => handleReset({ operatorId: item.OPERATORID })}
                  >
                    Reset
                  </button>
                </td>
                <td>
                  <button
                    className="reset-request-btn reject"
                    onClick={() => handleReject({ operatorId: item.OPERATORID })}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </span>
    </div>
  );
};

export default ResetRequest;
