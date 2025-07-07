import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/socket';
import { FaTimes } from 'react-icons/fa';
import "./OperatorList.css";

const OperatorList = ({ onClose }) => {
  const { socket } = useSocket();
  const [operators, setOperators] = useState([]);

  const fetchOperators = async () => {
    try {
      socket.emit('operatorList', (res) => {
        if (res.status === 200) {
          setOperators(res.data);
        } else {
          alert(`Failed to fetch Data: ${res.message}`);
        }
      });
    } catch (error) {
      alert('Failed to Emit to socket connection');
    }
  };

  useEffect(() => {
    if (operators.length === 0) {
      fetchOperators();
    }
  }, []);

  return (
    <div className="operator-list-overlay" onClick={onClose}>
    {/* {
        "ID": 3,
        "USERID": "8b6a1094-9e59-43c7-a2c8-7b729ecf7b2c",
        "USERNAME": "Nabil",
        "EMAIL": "nabil@360geoinfo.com",
        "PHONENUMBER": "8123456",
        "TOKEN": null,
        "FIRSTTIME": 1,
        "CREATED_AT":"2025-06-19T06:50:37.720Z",
        "UPDATED_AT": "2025-06-19T06:50:37.720Z" } */}

      <div className="operator-list-container" onClick={(e) => e.stopPropagation()}>
        <FaTimes
          size={24}
          className="operator-list-close-icon"
          onClick={onClose}
          title="Close"
          aria-label="Close modal"
        />
        <table className="operator-list-table" role="table" aria-label="Operator list">
          <thead>
            <tr>
              <th>ID</th>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>PHONENUMBER</th>
              <th>FIRSTTIME</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator) => (
              <tr key={operator.ID}>
                <td>{operator.ID}</td>
                <td>{operator.USERNAME}</td>
                <td>{operator.EMAIL}</td>
                <td>{operator.PHONENUMBER}</td>
                <td>{operator.FIRSTTIME}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperatorList;