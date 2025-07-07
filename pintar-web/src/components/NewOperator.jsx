import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useSocket } from '../../context/socket';
import './NewOperator.css'; 

const NewOperator = ({ onClose }) => {
    const { socket } = useSocket();
    const [details, setDetails] = useState({
        USERNAME: "",
        EMAIL: "",
        PHONENUMBER: "",
        password: "Pintar@123"
    })

    const [newOperatorData, setNewOperatorData] = useState(null);

    const handleInputChange = (e) => {
        let field = e.target.name;
        setDetails((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
    }

    const handleSubmit = async () => {
        try {
            socket.emit("insertNewOperator", details, (res) => {
                if (res.status === 200) {
                    setDetails({
                        USERNAME: "",
                        EMAIL: "",
                        PHONENUMBER: "",
                        password: "Pintar@123"
                    });
                    setNewOperatorData(res.data);
                } else {
                    alert(`Failed to insert new operator with status code of ${res.status}`);
                }
            });
        } catch (error) {
            alert(`Failed to insert new operator due to socket issues: ${JSON.stringify(error)}`);
        }
    }

    return (
        <div className="new-operator-overlay" onClick={onClose}>
            <span className="new-operator-modal" onClick={(e) => e.stopPropagation()}>
                <FaTimes className="new-operator-close" size={20} color="maroon" onClick={onClose} />
                {newOperatorData ? (
                    <pre>{JSON.stringify(newOperatorData, null, 2)}</pre>
                ) : (
                    <>
                        <div className="flex flex-col">
                            <label className="new-operator-label" htmlFor="USERNAME">Operator Username</label>
                            <input className="new-operator-input" type="text" name="USERNAME" value={details.USERNAME} onChange={handleInputChange} />
                        </div>
                        <div className="flex flex-col">
                            <label className="new-operator-label" htmlFor="EMAIL">Operator Email</label>
                            <input className="new-operator-input" type="email" name="EMAIL" value={details.EMAIL} onChange={handleInputChange} />
                        </div>
                        <div className="flex flex-col">
                            <label className="new-operator-label" htmlFor="PHONENUMBER">Operator Phone Number</label>
                            <input className="new-operator-input" type="tel" name="PHONENUMBER" value={details.PHONENUMBER} onChange={handleInputChange} />
                        </div>
                        <div className="new-operator-button-wrapper">
                            <button className="new-operator-button" onClick={handleSubmit}>Add</button>
                        </div>
                    </>
                )}
            </span>
        </div>
    );
};

export default NewOperator;
