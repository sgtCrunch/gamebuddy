import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    CardTitle,
    CardText,
  } from "reactstrap";
  

/** Form for loging in user.
 *
 * Has state for the info of the user; on submission,
 * sends {user} to fn rec'd from parent
 *
 */

const Login = ({ loginUser, updateUser }) => {
    const [formData, setFormData] = useState({});

    const navigate = useNavigate();

  
    /** Send {item} to parent
     *    & clear form. */
  
    const handleSubmit = async evt => {
      evt.preventDefault();
      const user = await loginUser();
      window.location.href = user;
    };

    /** render form */
  
    return (

        <section className="col-md-4">
        <Card>
            <CardBody>
            <CardTitle className="font-weight-bold text-center">
                Login
            </CardTitle>
                <form onSubmit={handleSubmit}>
                    <button>Connect From Steam</button>
                </form>
            </CardBody>
        </Card>
        </section>
      
    );
  };
  
  export default Login;
  