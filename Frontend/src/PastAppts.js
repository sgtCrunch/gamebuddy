import {React, useState, useEffect} from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import { useNavigate } from "react-router-dom";
import ApptCard from "./ApptCard";
import GBApi from "./api";
import './Home.css';
import loading from './loading.gif';


function PastAppts({user}) {

  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(()=>{
    getSessions();
  }, [user]);

  async function getSessions() {
    const s = await GBApi.getAppts({completed : "true", username : user.username});
    console.log(s);
    setSessions(s);
    setLoading(false);
  }

  if(isLoading) {
      return (
          <section>
              <Card>
                  <CardBody>
                      <img src={loading}/>
                  </CardBody>
              </Card>
          </section>
      );
  }

    return (
      <section className="col-md-8">
        <Card>
          <CardBody className="text-center">
            <h2 className="font-weight-bold">Past Sessions</h2>
            <br/>
            {console.log(sessions)}
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

export default PastAppts;