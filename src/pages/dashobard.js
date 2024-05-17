import React from "react";
import { Card, Row, Col } from "antd";
import useResponsive from "../hook/useResponsive";

const tableStyle = {
  width: "15%",
  textAlign: "center",
  margin: "10px",
  backgroundColor: "#9053c7",
  borderRadius: "10px",
  borderColor: "red",
  borderStyle: "inset",
  display: "flex",
  justifyContent: "center",
  borderWidth: "1px",
  fontSize: "20px",
};
const mobileStyle = {
  width: "15%",
  textAlign: "center",
  margin: "3px",
  backgroundColor: "#9053c7",
  borderRadius: "3px",
  display: "flex",
  justifyContent: "center",
  borderWidth: "1px",
  fontSize: "20px",
};

const Dashboard = () => {
  const { isMobile } = useResponsive();

  const gridItems = Array.from({ length: 30 }, (_, i) => (
    <Card.Grid key={i} style={isMobile ? mobileStyle : tableStyle}>
      {i + 1}
    </Card.Grid>
  ));
  const tableStatus = (
    <Card
      style={{
        width: "90vw",
        height: "90vh",
        backgroundColor: "#FFFFF",
        borderColor: "#d5155aeb",
        borderWidth: "2px",
      }}
      bodyStyle={{
        padding: "0",
        border: 0,
        backgroundColor: "#9053c778",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "50px",
        margin: "0px",
      }}
    >
      {gridItems}
    </Card>
  );
  const mobileStatus = (
    <Card
      style={{
        width: "90vw",
        height: "90vh",
        backgroundColor: "#FFFFF",
        borderColor: "#d5155aeb",
        borderWidth: "2px",
      }}
      bodyStyle={{
        padding: "0",
        border: 0,
        backgroundColor: "#9053c778",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "50px",
        paddingLeft: "0px",
        paddingRight: "0px",
        margin: "0px",
        overflow: "auto",
      }}
    >
      {gridItems}
    </Card>
  );

  return isMobile ? mobileStatus : tableStatus;
};

export default Dashboard;
