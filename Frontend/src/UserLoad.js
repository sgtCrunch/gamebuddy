import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";


function UserLoad({getUser, updateUser}) {

    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {username} = useParams();

    useEffect(() => {
        async function fetchUser(){
            const u = await getUser(username);
            localStorage.setItem("username", u.username);
            updateUser(u);
            setLoading(false);
            
            navigate("/profile");
        }

        fetchUser();
        
    }, []);

    if(isLoading) {
        return (
            <section>
                <Card>
                    <CardBody>
                        <h3>Loading..</h3>
                    </CardBody>
                </Card>
            </section>
        );
    }

    
}

export default UserLoad;