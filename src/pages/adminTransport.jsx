// ExampleComponent.js
import React, { useState } from "react";
import { useGetFlightsAdminQuery } from "@/api/api";
import Table from "../components/Common/Table";
import AdminHeader from "../components/Common/AdminHeader";

const adminTransport = () => {
  const {
    data: { Flights: flights } = {},
    error,
    isLoading,
  } = useGetFlightsAdminQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.data.message}</p>;
  }

  const data = flights || [];

  // Add an index to each flight,
  const indexedData = data.map((flight, index) => ({
    ...flight,
    index: index + 1,
  }));

  const columns = [
    {
      Header: "Index",
      accessor: "index",
    },
    {
      Header: "Flight Date",
      accessor: "flightDate",
    },
    {
      Header: "Airline",
      accessor: "airline",
    },
    {
      Header: "Departure Airport",
      accessor: "departure_airport",
    },
    {
      Header: "Arrival Airport",
      accessor: "arrival_airport",
    },
    {
      Header: "Departure Time",
      accessor: "departure_time",
    },
    {
      Header: "Flight Duration",
      accessor: "flight_time",
    },
    {
      Header: "Price",
      accessor: "price",
    },
  ];

  return (
    <>
      <AdminHeader />

      <div>
        <Table columns={columns} data={indexedData} />
      </div>
    </>
  );
};

export default adminTransport;
