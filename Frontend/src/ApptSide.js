import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from "reactstrap";
import AvatarIcon from './AvatarIcon';
import loading from "./loading.gif";
import AffirmForm from './AffirmForm';
import GameList from './GameList';

var moment = require('moment');
let roomUsers = [];

const ApptSide = ({ socket, session, GBApi, updateMsg, showMsg}) => {

  
  const [isLoading, setLoading] = useState(true);
  const [p1Online, setP1Online] = useState(false);
  const [p2Online, setP2Online] = useState(false);

  useEffect(() => {
    
    const updateState = (data) => {
      roomUsers = [...data];
      updateOnline();
      setLoading(false);
    }

    function updateOnline() {
      setP1Online(checkUsers(session.player_1));
      setP2Online(checkUsers(session.player_2));
    }

    socket.on('chatroom_users', updateState);

    return () => socket.off('chatroom_users');
  }, [socket]);

  function checkUsers(username){

    let online = false;
    roomUsers.forEach((user) => {
      if(user.username == username) online = true;
    });

    return online;
  }

  const handleSubmit = async evt => {
    evt.preventDefault();
    updateMsg((
      <AffirmForm 
        AffirmFunc={GBApi.cancelAppt.bind(GBApi)} 
        AffirmInput={session.appt_id}
        showMsg={showMsg}
        updateMsg={updateMsg}
        navUrl={"/"}
        socket={socket}
        session={session}/>
    ));
    
    showMsg(true);
  };

  function showGames() {
    updateMsg(<GameList session={session} styles={styles}/>);
    showMsg(true);
  }

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
    <div className={styles.roomAndUsersColumn}>
      <button className={styles.gamesButton} onClick={showGames}>🎮</button>
      <h3>
        {moment(session.start_time).format("MMM Do YYYY")}
        <br/>
        {moment(session.start_time).format("h:mm a")}
      </h3>
      <br/>
      <div>
        <AvatarIcon username={session.player_1} online={p1Online} />
        <br/>
        <AvatarIcon username={session.player_2} online={p2Online} />
        <br/>
        <form className='text-center' onSubmit={handleSubmit}>
          <button className="cancel-appt">Cancel Session</button>
        </form>
      </div>
    </div>
  );
};

export default ApptSide;