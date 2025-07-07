import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./Parking.css";
import { useSocket } from "../../../context/socket";
import { useEffect } from "react";
import dayjs from "dayjs";

export default function Parking() {
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, zoneList, isLoadingData } = useSocket();
  const [zoneData, setZoneData] = useState([]);
  const [parkingData, setOutdoorParkingData] = useState([]);
  const [filteredParkingData, setFilteredParkingData] = useState([]);
  // const [gatedParkingData, setGatedParkingData] = useState([]);
  // const [filteredGatedParkingData, setFilteredGatedParkingData] = useState([]);
  const [parkingByZones, setParkingByZones] = useState();

  useEffect(() => {
    if (!isLoadingData && zoneList?.length > 0) {
      const formattedZoneData = zoneList.map((zone) => ({
        zone: `Zone ${zone.CODE}`,
        locations: [`${zone.NAME}`],
        type: `${zone.TYPE}`,
      }));
      setZoneData(formattedZoneData);
    }
  }, [zoneList, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData && zoneList?.length > 0) {
      console.log("🔄 Fetching parking data...");
      socket.emit("getParkingData", async (res) => {
        console.log("🚗 Parking Data Response:", res);

        if (res.status === 200) {
          setOutdoorParkingData(res.data.outdoorParking);
          setFilteredParkingData(res.data.outdoorParking);

          const byZone = {};

          Object.values(res.data).forEach((group) => {
            Object.values(group).forEach((parking) => {
              const { ZONE, ...parkingData } = parking;

              const key = `Zone ${ZONE}`;

              if (!byZone[key]) {
                byZone[key] = []; // Initialize as array if not already present
              }

              byZone[key].push(parking); // Push to the correct zone array
            });
          });

          setParkingByZones(byZone);

          console.log("🚗 Outdoor Parking Data:", res.data.outdoorParking);

          // setGatedParkingData(res.data.gatedParking);
          // setFilteredGatedParkingData(res.data.gatedParking);
        } else {
          console.error("❌ Failed to fetch parking data:", res.message);
        }
      });
    }
  }, [zoneList, isLoadingData, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("parkingExpired", (res) => {
      setParkingByZones((prevByZones) => {
        const updatedZoneList =
          prevByZones[zoneKey]?.map((parking) => {
            if (parking.ID === res.ID) {
              return { ...res }; // Replace with updated/expired parking
            }
            return parking;
          }) || [];

        return {
          ...prevByZones,
          [zoneKey]: updatedZoneList,
        };
      });
      setOutdoorParkingData((prevData) => {
        const updated = prevData.map((parking) => {
          if (parking.ID === res.ID) {
            // Replace the matching parking with the expired one
            return res;
          }
          return parking;
        });
        return updated;
      });
    });

    // Optional cleanup to avoid memory leaks
    return () => {
      socket.off("parkingExpired");
    };
  }, [socket]);

  console.log("Parking By Zones:", parkingByZones);

  const filteredZones = zoneData.filter(
    (zoneItem) =>
      zoneItem.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zoneItem.locations.some((loc) =>
        loc.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // const filteredTransactions = transactions.filter((t) => {
  //   const values = Object.values(t).join(" ").toLowerCase();
  //   return values.includes(searchTerm.toLowerCase());
  // });

  const displayTimeRange = (startDate, startTime, endDate, endTime) => {
    const startDateTime = dayjs(`${startDate} ${startTime}`);
    const endDateTime =
      endDate || endTime ? dayjs(`${endDate} ${endTime}`) : null;
    return startDateTime.isValid()
      ? endDateTime && endDateTime.isValid()
        ? `${startDateTime.format("DD/MM/YYYY HH:mm")} - ${endDateTime.format(
            "DD/MM/YYYY HH:mm"
          )}`
        : `${startDateTime.format("DD/MM/YYYY HH:mm")} - Ongoing`
      : "-";
  };

  const displayTime = (date, time) => {
    const dateTime = dayjs(`${date} ${time}`);
    return dateTime.isValid() ? dateTime.format("DD/MM/YYYY H:mm A") : "-";
  };
  return (
    <>
      <div className="cards-row">
        <div className="card">
          <h3>Total Parking Slots</h3>
          <p>694</p>
          <span className="card-subtext">All available slots city-wide</span>
        </div>
        <div className="card">
          <h3>Slot Used</h3>
          <p>870</p>
          <span className="card-subtext">Currently occupied</span>
        </div>
        <div className="card">
          <h3>Total Petak Used</h3>
          <p>2,500</p>
          <span className="card-subtext">Since tracking began</span>
        </div>
        <div className="card">
          <h3>Petak Used Today</h3>
          <p>150</p>
          <span className="card-subtext">Usage for today</span>
        </div>
        <div className="card">
          <h3>Total Petak Added</h3>
          <p>3,000</p>
          <span className="card-subtext">Cumulative added slots</span>
        </div>
      </div>

      {/* Zone Cards */}
      <div className="zone-grid">
        {filteredZones.map((zoneItem, index) => (
          <div
            className="card-zone flex flex-col min-h-50"
            key={index}
            onClick={() =>
              setFilteredParkingData(parkingByZones[zoneItem.zone] || [])
            }
          >
            <span className="flex flex-col grow">
              <h3>{zoneItem.zone}</h3>
              <span className="card-subtext">
                {zoneItem.locations.map((location, i) => (
                  <span key={i}>{location}</span>
                ))}
              </span>
            </span>
            <span>
              Currently Parking:{" "}
              {parkingByZones ? parkingByZones[zoneItem.zone]?.length || 0 : 0}
            </span>
            <small>{`${zoneItem.type} PARKING`.toLocaleLowerCase()}</small>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search zone, location, or transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <FaSearch className="search-icon" />
      </div>
      {/* <pre>{JSON.stringify({ zoneList, filteredParkingData }, null, 2)}</pre> */}
      {/* Transaction Table */}
      <div className="transaction-table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Transaction ID</th>
              <th>Parking Details</th>
              <th>Vehicle Details</th>
              <th>Payment Status</th>
              <th>Status</th>
            </tr>
          </thead>
          {/* <tbody>
            {filteredTransactions.map((t, index) => (
              <tr key={t.transactionId}>
                <td>{index + 1}</td>
                <td>{t.userId}</td>
                <td>{t.transactionId}</td>
                <td>{t.plateLicense}</td>
                <td>{t.duration}</td>
                <td>{t.startDateTime}</td>
                <td>{t.endDateTime}</td>
                <td>{t.petak}</td>
                <td>{t.zone}</td>
                <td>{t.status}</td>
                <td>{t.paymentStatus}</td>
              </tr>
            ))}
          </tbody> */}
          <tbody>
            {filteredParkingData.length > 0 ? (
              filteredParkingData.map((parking, index) => (
                <tr key={parking.PETAK}>
                  <td>{index + 1}</td>
                  <td>{parking.IDTRANSACTION || "-"}</td>
                  <td>
                    <ul>
                      <li>
                        Started:{" "}
                        {displayTime(parking.STARTDATE, parking.STARTTIME)}
                      </li>
                      <li>
                        Ended: {displayTime(parking.EXITDATE, parking.EXITTIME)}
                      </li>
                      <li>
                        Duration:{" "}
                        {parking.DURATION ? `${parking.DURATION} hrs` : "-"}
                      </li>
                      <li className="mt-2">
                        Parking Zone:{" "}
                        {(() => {
                          const zone = zoneList.find(
                            (z) => z.CODE === parking.ZONE
                          );
                          return `${zone?.CODE} - ${zone?.NAME}` || "-";
                        })()}
                      </li>
                    </ul>
                  </td>
                  <td>
                    <span className="flex flex-col items-start gap-1">
                      <p>{parking.VEHICLE?.PLATLICENSE || "-"}</p>
                      <p>{parking.VEHICLE?.VEHICLEMODEL || "-"}</p>
                      <p>Owner: {parking.VEHICLE?.USER?.USERNAME || "-"}</p>
                    </span>
                  </td>

                  <td>{parking.PAYMENTSTATUS || "-"}</td>
                  <td>{parking.PETAKSTATUS || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No parking data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Print Button */}
        <div className="print-section">
          <button className="print-button" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
        </div>
      </div>
    </>
  );
}
