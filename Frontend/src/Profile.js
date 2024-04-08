import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    CardTitle,
    CardText,
  } from "reactstrap";


/** Form for updating a user.
 *
 * Has state for the info of the user; on submission,
 * sends {user} to fn rec'd from parent
 *
 */

const Profile = ({ user, setUser, updateUser }) => {
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    if(Object.keys(user).length < 1){
        return(<h3 style={{color:"black"}}>Not Authorized</h3>);
    }

    async function refreshUser(data) {
        let tempUser;
        tempUser = await updateUser(data);
        setUser(tempUser);
        navigate("/");
    }

  
    /** Send {item} to parent
     *    & clear form. */
  
    const handleSubmit = async evt => {
      evt.preventDefault();
      await refreshUser(formData);
    };
  
    /** Update local state w/curr state of input elem */
  
    const handleChange = evt => {
      const { name, value }= evt.target;
      setFormData(fData => ({
        ...fData,
        [name]: value
      }));
    };
  
    /** render form */
  
    return (

        <section className="col-md-4">
        <Card>
            <CardBody>
            <CardTitle className="font-weight-bold text-center">
                Profile
            </CardTitle>
                <form onSubmit={handleSubmit}>

                    <br/>
                    <input
                        type="Text"
                        id="username"
                        name="username"
                        value= {user.username}
                        onChange={handleChange}
                        disabled
                    />
                    <br/>
                    <input
                        type="Text"
                        id="firstName"
                        name="firstName"
                        placeholder={user.firstName}
                        onChange={handleChange}
                    />
                    <br/>
                    <input
                        type="Text"
                        id="lastName"
                        name="lastName"
                        placeholder={user.lastName}
                        onChange={handleChange}
                    />
                    <br/>
                    <input
                        type="Text"
                        id="email"
                        name="email"
                        placeholder={user.email}
                        onChange={handleChange}
                    />
                    <br/><br/>
                    <button>Save Changes</button>
                </form>
            </CardBody>
        </Card>
        </section>
      
    );
  };
  
  export default Profile;
  