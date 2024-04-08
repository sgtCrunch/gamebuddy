import {React, useEffect, useState} from "react";
import './ApptCard.css';
import GBApi from "./api";
import onlineImg from './Online.gif';
import offlineImg from './Offline.gif';
import styles from './styles.module.css';


function AvatarIcon({username, online}) {

    const [img, setImg] = useState("");
    const [onlineIcon, setOnlineIcon] = useState("");

    useEffect(()=>{

        async function getIMG(username, online){
           const img = await GBApi.getUserImg(username);
           setImg(img.medium);
           if(online){
            setOnlineIcon(onlineImg);
           }else{
            setOnlineIcon(offlineImg);
           }
        }
        
        getIMG(username, online);
        
    }, [online]);

    return (
        <div className={styles.avatarCard}>
            <img className="OnlineIcon" src={onlineIcon}/>
            &nbsp;&nbsp;
            <img src={img}/>
            &nbsp;&nbsp;{username}
        </div>
    );
}

export default AvatarIcon;