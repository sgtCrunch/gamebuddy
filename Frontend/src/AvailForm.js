import {React, useEffect, useState} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import GBApi from './api';
import "./AvailForm.css";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
                "7pm", "8pm", "9pm", "10pm", "11pm", "12am", "1am", "2am", "3am", "4am",
                "5am", "6am", "7am", "8am"];

let iconURL = "";

function AvailForm({user}) {

    const [formData, setFormData] = useState({});
    const [availMat, setAvailMat] = useState([]);
    const [maxAppt, setMaxAppt] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();

    
    useEffect(() => {
        async function getAvailMat(){
            let mat = await GBApi.getAvailMat();
            setAvailMat(mat);
            setLoading(false);
        }
        
        getAvailMat();

    }, []);

    const handleSubmit = async evt => {
        evt.preventDefault();
        if(formData.max_appt) {
            formData.availMat = availMat;
            await GBApi.updateUser(formData);
            setLoading(true);
            navigate("/");
        }
    };
    
    
    const handleChange = evt => {
        const { name, value }= evt.target;

        if(name == "max_appt") {

            setFormData({"max_appt" : value})

        }else{
           const copy = availMat.map(hour => hour.slice());
           copy[value][name] = (copy[value][name] + 1) % 2; 
           setAvailMat(copy);
        }

        
    };

    if(isLoading) {
        return (
            <section>
                <Card>
                    <CardBody>
                        <img src="./loading.gif"/>
                    </CardBody>
                </Card>
            </section>
        );
    }

    return (
    <section>
        <Card>
            <CardBody className="text-center">
                <h3>Welcome, {user.username}</h3>
                <img src={JSON.parse(user.avatar).medium}></img>
                <br/>
                <form onSubmit={handleSubmit}>

                    <br/>
                    <select name="max_appt" onChange={handleChange} required>
                        <option value="none" selected disabled hidden>Appointments/week?</option> 
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    <br/>
                    <br/>
                    <table>
                        <tbody>
                            <tr>
                                <td></td>
                                {
                                    days.map(day => {
                                        return <th id="day">{day}</th>
                                    })
                                }
                            </tr>

                            {
                                hours.map((hour, hourIdx) => {
                                    return (
                                        <tr>
                                            <th>{hour}</th>
                                            {
                                                days.map((day, dayIdx) => {

                                                    if(availMat[hourIdx][dayIdx] == 1) 
                                                        return (<td id="td_check"><input id={dayIdx+"-"+hourIdx} type="checkbox" name={dayIdx} value={hourIdx} onChange={handleChange} checked/><label for={dayIdx+"-"+hourIdx}></label></td>);
                                                    return (<td id="td_check"><input id={dayIdx+"-"+hourIdx} type="checkbox" name={dayIdx} value={hourIdx} onChange={handleChange}/><label for={dayIdx+"-"+hourIdx}></label></td>);

                                                })
                                            }
                                        </tr>
                                    );
                                })
                            }
                        </tbody>

                    </table>
                    <br/>
                    <br/>
                    <button id="availButton">Save</button>
                </form>
                <br/><br/>
            </CardBody>
        </Card>
    </section>
    );
}

export default AvailForm;