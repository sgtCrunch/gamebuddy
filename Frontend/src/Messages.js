import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';
var moment = require('moment');

const Messages = ({ socket, session }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const messagesColumnRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          sender: data.sender,
          send_time: data.send_time
        },
      ]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

    useEffect(() => {
      socket.on('messages', (messages) => {
        console.log(messages);
        if(messages){
          messages = sortMessagesByDate(messages);
          setMessagesReceived(messages);
        }
      });

    return () => socket.off('messages');
    }, [socket]);


    useEffect(() => {
        messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
    }, [messagesRecieved]);


    function sortMessagesByDate(messages) {
        return messages.sort(
            (a, b) => parseInt(a.send_time) - parseInt(b.send_time)
        );
    }


  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
      {messagesRecieved.map((msg, i) => (
        <div>
        <div className={styles.message} id={(msg.sender != session.player_1) ? styles.player2Style : "" } key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.sender}</span>
            <span className={styles.msgMeta}>
              {moment(msg.send_time).format("MMM Do h:mma")}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;