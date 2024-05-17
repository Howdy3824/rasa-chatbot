import React from "react";
import { Button, Checkbox, Form, Input, Card, Col, Row, Image } from "antd";
import styled from "styled-components";
import "./login.css";
const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
const StyledInput = styled(Input)`
  background-color: dark-gray;
`
const Login = () => (
  
    <div className="login_div">
      <Col>
        <h1 style={{fontSize:"32px",fontWeight:'800',marginBottom:'0px', color:"white", marginTop:'0px'}}>Login</h1>
        <h4 style={{paddingBottom:'32px',fontWeight:'400',paddingTop:'0px',marginTop:'0px', fontSize:'16px',fontWeight:'500', color:'#7d8995'}}>Please sign in to your account</h4>
        <Form>
          <Form.Item name="email">
            <StyledInput placeholder="Email ID"></StyledInput>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                222222222
          </Form.Item>
          <Form.Item name="password">
            <StyledInput placeholder="Email ID" type="password"></StyledInput>
          </Form.Item>
        </Form>
      </Col>
      
    </div>

);
export default Login;
