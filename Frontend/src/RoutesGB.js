import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Login";
import Home from "./Home";
import GBApi from "./api";
import Logout from "./Logout";
import UserLoad from "./UserLoad";
import AvailForm from "./AvailForm";
import PastAppts from "./PastAppts";
import ApptInfo from "./ApptInfo";


function RoutesGB({user, socket, updateUser, updateRoom, updateMsg, showMsg }) {
    
    return (
        <Routes>
            <Route exact path="/" element={<Home user={user} showMsg={showMsg} updateMsg={updateMsg}/>}/>
            <Route exact path="/profile" element={<AvailForm user={user} setUser={updateUser} updateUser={GBApi.updateUser.bind(GBApi)}/>}/>
            <Route exact path="/login" element={<Login loginUser={GBApi.loginUser.bind(GBApi)} updateUser={updateUser}/>}/>
            <Route exact path="/logout" element={<Logout logout={GBApi.logout.bind(GBApi)} updateUser={updateUser}/>}/>
            <Route path="/user/:username" element={<UserLoad getUser={GBApi.getUser.bind(GBApi)} updateUser={updateUser}/>}/>
            <Route path="/appts/:id" element={<ApptInfo socket={socket} user={user} updateRoom={updateRoom} updateMsg={updateMsg} showMsg={showMsg} />}/>
            <Route exact path="/past-sessions" element={<PastAppts user={user}/>}/>
            <Route element={<p>Hmmm. I can't seem to find what you want.</p>}/>
        </Routes>
    );
}

export default RoutesGB;
