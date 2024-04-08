
import styles from './styles.module.css';
import React, { useState } from 'react';
var moment = require('moment');


const SendMessage = ({ socket, username, room }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false)


  const sendMessage = (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (message !== '') {
      const send_time = moment();
      socket.emit('send_message', { sender:username, room, message, send_time });
      setMessage('');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.sendMessageContainer}>
      <form onSubmit={sendMessage}>
        <input
          className={styles.messageInput}
          placeholder=''
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button type="submit" disabled={submitting} className={'btn btn-primary '+styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default SendMessage;