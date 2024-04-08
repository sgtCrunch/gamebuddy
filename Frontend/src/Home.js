import {React, useState, useEffect} from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import ApptCard from "./ApptCard";
import GBApi from "./api";
import './Home.css';
import loading from './loading.gif';


function Home({user, updateMsg, showMsg}) {

  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(()=>{
    if(Object.keys("username").length > 0) getSessions();
  }, []);

  async function getSessions() {
    const s = await GBApi.getAppts({completed : "false", username : user.username});
    setSessions(s);
    setLoading(false);
  }

  const handleSubmit = async evt => {
    evt.preventDefault();
    let results = "";
    try{
      results = await GBApi.createAppt({player_1:user.username});
    }
    catch (e){
      updateMsg((<h3>{e.message} <br/>Try again later</h3>));
      showMsg(true);
      return;
    }

    if(results.appt.msg){
      updateMsg((<h3>{results.appt.msg} <br/>Try again later</h3>));
      showMsg(true);
      return;
    } 
    await getSessions();
  };


  if(Object.keys(user).length > 0){
    if(isLoading) {
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
      <section className="col-md-8">
        <Card>
          <CardBody className="text-center">

            <form onSubmit={handleSubmit}>
              <button className="add-appt"><h3>+</h3></button>
            </form>
            <h2 className="font-weight-bold">Upcoming Sessions</h2>
            <br/>
            <div className="sessions">
              {sessions.map(session => {
                return <ApptCard session={session} />;
              })}
            </div>
          </CardBody>
        </Card>
      </section>
    );
  }

  return (
    <section className="col-md-8">
      <Card>
        <CardBody className="text-center">
          <CardTitle>
            <h1 className="font-weight-bold">
              GameBuddy
            </h1>
            <h4>NEVER GAME ALONE.</h4>
          </CardTitle>
        </CardBody>
      </Card>
    </section>
  );
}

export default Home;