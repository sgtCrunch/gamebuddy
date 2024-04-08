import {React} from "react";
import { useNavigate } from "react-router-dom";


function AffirmForm({AffirmFunc, AffirmInput, updateMsg, showMsg, navUrl, socket, session}) {

    const navigate = useNavigate();

    const handleSubmit = async evt => {
        evt.preventDefault();
        let results = "";
        console.log(AffirmInput);
        try{
          results = await AffirmFunc(AffirmInput);
          console.log("HELLOOOOO");
          showMsg(false);
          socket.emit("cancel", { username:session.player_1, room:session.appt_id });
          if(navUrl) navigate(navUrl);
        }catch (e) {
          updateMsg((<h3> {e+""} <br/> Failed, try again later</h3>));
          showMsg(true);
          return;
        }
    
    };

    return (
        <div>

            <h3>Are you sure?</h3>
            <form onSubmit={handleSubmit}>
                <button className="cancel-appt">Confirm</button>
            </form>
            <br/>
            <button onClick={()=>showMsg(false)}>Go Back</button>
            
        </div>
    );
}

export default AffirmForm;