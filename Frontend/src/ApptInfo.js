import {React, useEffect, useState} from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import GBApi from "./api";
import styles from './styles.module.css';
import SendMessage from "./SendMessage";
import Messages from "./Messages";
import ApptSide from "./ApptSide";
import loading from "./loading.gif";

function ApptInfo({user, socket, updateMsg, showMsg }) {

    const { id } = useParams();
    const [session, setSession] = useState({});
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(()=>{

        async function getAppt(id) {
            const appt = await GBApi.getApptInfo(id);
            setSession(appt);
            console.log(appt);
            socket.emit('join_room', { username : GBApi.username, room : id});
            setLoading(false);
        }

        if(GBApi.username) {
            getAppt(id);
        }

        
    }, []);

    useEffect(() => {

        function cancelMsg(){
            updateMsg((<h3>"Other User has cancelled"</h3>));
            showMsg(true);
            navigate("/");
        }
    
        socket.on('user_cancelled', cancelMsg);
        return () => socket.off('chatroom_users');

    }, [socket]);

    if(isLoading){
        return (
            <section>
                <Card>
                    <CardBody>
                        <img src={loading} alt="...loading" />
                    </CardBody>
                </Card>
            </section>
        ); 
    }

    return (
        <div className={styles.chatContainer}>
            <ApptSide session={session} socket={socket} GBApi={GBApi} updateMsg={updateMsg} showMsg={showMsg}/>
            
            <div>
                <Messages socket={socket} session={session} />
                <SendMessage socket={socket} username={GBApi.username} room={id} />
            </div>

        </div>
    );
}

export default ApptInfo;