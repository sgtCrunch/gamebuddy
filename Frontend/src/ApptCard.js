import {React, useEffect, useState} from "react";
import { Navigate, useParams } from "react-router-dom";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import './ApptCard.css';
import GBApi from "./api";
var moment = require('moment');


function ApptCard({session}) {

    const [img, setImg] = useState("");
    const [cancelMsg, setCancelMsg] = useState("");

    
    useEffect(()=>{

        async function getIMG(session){
           const img_url = await GBApi.getUserImg(session.player_2);
           setImg(img_url.medium); 
        }

        getIMG(session);

        if(session.cancelled) setCancelMsg("Cancelled");
        
    }, []);

    return (
    <a className="appt" href={(!session.complete) ? `/appts/${session.appt_id}` : ""}>
        <div>
            <h3>{session.player_2}</h3>
            <img src={img}/>
            <br/>
            {moment(session.start_time).format("MMM Do YYYY")}
            <br/>
            {moment(session.start_time).format("h:mma")}
            <h5>{cancelMsg}</h5>
        </div>
    </a>
    );
}

export default ApptCard;