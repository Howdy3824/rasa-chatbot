import React from "react";
import useResponsive from "../hook/useResponsive";
import { Button, Form, Input, Card, Col, Row, Divider, Typography } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import styled from "styled-components";

// const StartButton = styled(Button)`
//   color: #FFFFF;
//   background: #9053c7;
// `;

const Task = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const mobileStatus = (
    <Card
      style={{
        minWidth: "80vw",
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Row
        style={{
          minHeight: "30%",
          alignItems: "center",
        }}
      >
        <b
          style={{
            fontSize: "1.875em",
            textAlign: "center",
            minWidth: "70vw",
          }}
        >
          Member Login
        </b>
      </Row>
      <Row>
        <Form style={{ minWidth: "70vw" }}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Email!",
              },
            ]}
          >
            <Input type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Password!",
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              className="submit"
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
                backgroundColor: "#57b846",
                cursor: "pointer",
              }}
            >
              Submit
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              style={{
                borderStyle: "none",
                color: "black",
                backgroundColor: "white",
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "#57b846",
              }}
            >
              Forgot userName/PasswordName?
            </Button>
          </Form.Item>
        </Form>
      </Row>
    </Card>
  );

  const tabletStatus = (
    <Card
      style={{
        minWidth: "80vw",
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Row style={{ minHeight: "100%" }}>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column-reverse",
          }}
        >
          <img
            src="assets/login.png"
            alt="IMG"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <b
            style={{
              fontSize: "1.875em",
              textAlign: "center",
              minWidth: "30vw",
              padding: "20px",
            }}
          >
            Member Login
          </b>
          <Form style={{ minWidth: "30vw" }}>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Email!",
                },
              ]}
            >
              <Input type="email" placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Password!",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button
                className="submit"
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#57b846",
                  cursor: "pointer",
                }}
              >
                Submit
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                style={{
                  borderStyle: "none",
                  color: "black",
                  backgroundColor: "white",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "#57b846",
                }}
              >
                Forgot userName/PasswordName?
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
  const desktopStatus = (
    <Card
      title="Talk about yourself"
      headStyle={{ fontSize: "25px" }}
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
        // display: "flex",
        // justifyContent: "center",
      }}
    >
      <Row style={{ minHeight: "600px", minWidth: "900px" }}>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="assets/days/Day2.png"
            alt="IMG"
            style={{ maxWidth: "70%", height: "auto" }}
          />
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider
            orientation="left"
            style={{ fontSize: "30px", borderColor: "#9053c7" }}
            dashed
          >
            Task
          </Divider>
          <Typography>
            <pre>say something about yourself</pre>
          </Typography>
          <Typography>
            <pre>say why you are good fit for the role</pre>
          </Typography>
          <Button
            icon={<ThunderboltOutlined />}
            style={{ marginTop: "10%" }}
            size="large"
          >
            Start Conversation
          </Button>
        </Col>
      </Row>
    </Card>
  );

  return isMobile ? (
    <>{mobileStatus}</>
  ) : (
    <>{isTablet ? tabletStatus : desktopStatus}</>
  );
};

export default Task;
